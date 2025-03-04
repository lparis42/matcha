import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { profile } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod";
import { constants } from "../../../constants";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { XCircle } from "lucide-react";
import { MultiSelector, MultiSelectorContent, MultiSelectorInput, MultiSelectorItem, MultiSelectorList, MultiSelectorTrigger } from "@/components/ui/multiselect";
import { useSocket } from "@/api/Socket";
import imageCompression from 'browser-image-compression';
import MapView from "@/components/map";
import { toast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { useAccount } from "@/hook/useAccount";

const convertToBase64 = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const options = {
  maxSizeMB: 1,
  maxWidthOrHeight: 512,
  useWebWorker: true,
};

const pictures_compress = async (file) => {
  if (file === null) {
    return null;
  }
  try {
    // Compress the image file
    const compressedFile = await imageCompression(file, options);
    if (compressedFile.size > options.maxSizeMB * 1024 * 1024) {
      throw new Error("File size exceeds the 1mb limit after compression");
    }
    // Convert the compressed file to base64
    const base64: string = await convertToBase64(compressedFile) as string;
    return base64;
  }
  catch (error) {
    toast({title: error.message});
    return null;
  }
}

export const interests_to_int = (interests) => {
  return interests.map((interest) => {
    return constants.interests.indexOf(interest)
  })
}

const interests_to_string = (interests) => {
  return interests.map((interest) => {
    return constants.interests[interest]
  })
}

const prefix_pictures = (pictures) => {
  if (pictures === null || pictures === undefined) {
    return [null, null, null, null, null]
  }
  if (pictures.length === 0) {
    return [null, null, null, null, null]
  }
  return pictures.map((picture) => {
    if (picture === '')
      return null;
    return `${picture}`
  })
}

export function Component() {
    const { account: user } = useAccount();
    const {eventEdit, eventAccount} = useSocket();
    const form = useForm<z.infer<typeof profile>>({
      resolver: zodResolver(profile),
      defaultValues: {
        gender: user.gender ? user.gender : constants.genders[0],
        sexual_orientation: user.sexual_orientation || constants.sexual_orientations[0],
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        date_of_birth: user.date_of_birth ? new Date(user.date_of_birth) : new Date(2000, 1, 1),
        biography: user.biography || "",
        common_tags: user.common_tags ? interests_to_string(user.common_tags) : [],
        pictures: prefix_pictures(user.pictures),
        geolocation: user.geolocation ? {lat: Number(user.geolocation[0]), lng: Number(user.geolocation[1])} :
        {
          lat: 48.89666602483836,
          lng: 2.3183834552764897
        } 
      },
    })
    
    const {setValue, getValues, watch} = form

    useEffect(() => {
      const isNoPictures = (!user.pictures || user.pictures.length === 0 || user.pictures[0] === '')
      if (isNoPictures) {
        toast({title: "You need to upload at least one picture"})
      }

      //geolocation()
    }, [])
    
    //async function geolocation() {
    //  const [err, data] = await eventGeolocation()
    //  if (err) {
    //    return
    //  }
    //  setValue('geolocation', {lat: data.latitude, lng: data.longitude})
    //  console.log({lat: data.latitude, lng: data.longitude})
    //}
   
    function onSubmit(values: z.infer<typeof profile>) {
      const data = {...values,
        geolocation: 
        {
          latitude: values.geolocation.lat,
          longitude: values.geolocation.lng
        },
        common_tags: interests_to_int(values.common_tags)
      }
      eventEdit(data, (err) => {
        if (err) {
          console.error(err);
        } else {
          eventAccount({account: user.id})
          toast({title: "Profile updated successfully"})
        }
      })
    }

    const onSelectFile = async (e) => {
      const file = e.target.files[0];
      
      const prevFiles = getValues('pictures')
      const prev = prevFiles.findIndex((file) => file === null)
      prevFiles[prev] = await pictures_compress(file)
      setValue('pictures', prevFiles)
    }

    const onDeletePicture = (index) => {
      const prevFiles = getValues('pictures')
      prevFiles[index] = null
      setValue('pictures', prevFiles)
    }

    return (
      <main className="flex items-center justify-center p-6">
      <div className="grid gap-8">
      <Card>
      <CardHeader>
        <CardTitle>Personal Details</CardTitle>
        <CardDescription>Update your personal information here.</CardDescription>
      </CardHeader>
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
      <CardContent className="grid gap-4">
        <div className="space-y-2">
          <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="john" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
          />
          <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
          />
        <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input placeholder="john@doe.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
        />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="sexual_orientation">sexual orientation</Label>
            <FormField
            control={form.control}
            name="sexual_orientation"
            render={({ field }) => (
              <FormItem>
              <Select onValueChange={field.onChange} defaultValue={user.sexual_orientation || constants.sexual_orientations[0]}>
                <FormControl>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {constants.sexual_orientations.map((orientation) => (
                    <SelectItem key={orientation} value={orientation}>
                      {orientation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
              </FormItem>
            )}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="gender">gender</Label>
            <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
              <Select onValueChange={field.onChange} defaultValue={user.gender || constants.genders[0]}>
                <FormControl>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                      {constants.genders.map((gender) => (
                        <SelectItem key={gender} value={gender}>
                          {gender}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              <FormMessage />
              </FormItem>
            )}
            />
          </div>
        </div>
        <div>
          <FormField
            control={form.control}
            name="date_of_birth"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of birth</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="space-y-1">
        <FormField
          control={form.control}
          name="biography"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Biography</FormLabel>
              <FormControl>
                <Textarea placeholder="bio" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
          />
        </div>
        <div className="space-y-1">
        
        <FormField
            control={form.control}
            name="common_tags"
            render={({ field }) => (
              <FormItem className="w-full">
              <FormLabel>Interests</FormLabel>
              <MultiSelector
                onValuesChange={field.onChange}
                values={field.value}
              >
                <MultiSelectorTrigger>
                  <MultiSelectorInput placeholder="Select differents interests ..." />
                </MultiSelectorTrigger>
                <MultiSelectorContent>
                  <MultiSelectorList>
                    {constants.interests.map((value) => (
                      <MultiSelectorItem key={value} value={value}>
                        <div className="flex items-center space-x-2">
                          <span>{value}</span>
                        </div>
                      </MultiSelectorItem>
                    ))}
                  </MultiSelectorList>
                </MultiSelectorContent>
              </MultiSelector>
              <FormMessage />
            </FormItem>
            )}
            />
        </div>
      </CardContent>
      <CardHeader>
        <CardTitle>Profile Photo</CardTitle>
        <CardDescription>Update your profile photo here. 512 x 512</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {getValues('pictures')[0] === null && <span className="text-red-500 font-medium">Almost one image is required</span>}
        <div className="flex flex-wrap gap-6 max-w-xl justify-center">
          {watch('pictures').map((file, index) => {
              if (file === null || file === '') {
                return (
                  <div key={index} className="rounded w-40 h-40 outline-4 outline-dashed outline-gray-400 select-none" onClick={() => {document.getElementById(`picture${index}`).click()}}>
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <span>+</span>
                    </div>
                    <input id={`picture${index}`} type="file" onChange={(e) => onSelectFile(e)} style={{ display: 'none' }}/>
                  </div>
                )
              }
              return (
                <div key={index} className="rounded w-40 h-40 outline-4 outline outline-gray-400 select-none relative">
                  <div className="absolute -right-3 -top-3 w-5 h-5" onClick={() => onDeletePicture(index)}>
                  <XCircle className="w-5 h-5 text-red-500" fill="#fff"/>
                  </div>
                  <img src={file.startsWith('data') ? file : `https://${window.location.hostname}:2000/images/` + file} alt="Preview" className="rounded w-40 h-40 object-cover"/>
                </div>
              )
            }
          )}
        </div>
      </CardContent>
      <CardHeader>
        <CardTitle>Location</CardTitle>
      </CardHeader>
      <CardContent>
        <MapView setter={setValue} default_value={[watch('geolocation.lat'), watch('geolocation.lng')]}/>
      </CardContent>
      <CardFooter>
        <Button type="submit">Save Changes</Button>
      </CardFooter>
        </form>
      </Form>
    </Card>
    </div>
    </main>
      )
}

