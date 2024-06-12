import React, {useEffect, useState} from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { profile } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod";
import { constants } from "../../../constants";
import { DatePickerDemo } from "@/components/ui/datepicker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export function Component() {

    const form = useForm<z.infer<typeof profile>>({
      resolver: zodResolver(profile),
      defaultValues: {
        gender: constants.genders[0],
        sexual_orientation: constants.sexual_orientations[0],
        first_name: "",
        last_name: "",
        email: "",
        birth_date: new Date(),
        biography: "",
        interests: [],
        pictures: [],
        geolocation: {
          latitude: 0,
          longitude: 0
        }
      },
    })
    
    const {setValue, getValues} = form
   
    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof profile>) {
      // Do something with the form values.
      // ✅ This will be type-safe and validated.
      console.log(values)
      //edit profil
    }

    const onSelectFile = e => {
      const prevFiles = getValues('pictures')
      console.log(prevFiles)
      if (!e.target.files || e.target.files.length === 0) {
          setValue('pictures', [])
          return
      }
      setValue('pictures', prevFiles.concat(Array.from(e.target.files)))
      //setSelectedFiles(prevFiles => );
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
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="sexual_orientation">sexual orientation</Label>
            <FormField
            control={form.control}
            name="sexual_orientation"
            render={({ field }) => (
              <FormItem>
              <Select onValueChange={field.onChange} defaultValue={constants.sexual_orientations[0]}>
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
              <Select onValueChange={field.onChange} defaultValue={constants.genders[0]}>
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
            name="birth_date"
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
            name="interests"
            render={({ field }) => (
              <FormItem>
              <FormLabel>Interests</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={constants.interests[0]}>
                <FormControl>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {constants.interests.map((interest) => (
                    <SelectItem key={interest} value={interest}>
                      {interest}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        <div className="flex flex-wrap gap-4">
          {getValues('pictures').map((file, index) => {
              console.log(file, getValues('pictures'))
              return (
                <div key={index}>
                  <img src={URL.createObjectURL(file)} alt="Preview" className="rounded w-20 h-20"/>
                </div>
              )
            }
          )}
        </div>
          <div className="">
            <Label htmlFor="picture"></Label>
            <Input id="picture" type="file" onChange={onSelectFile} style={{ display: 'none' }}/>
            <Button onClick={(e) => {e.preventDefault(); document.getElementById('picture').click()}}>Add picture</Button>
          </div>
      </CardContent>
      <CardHeader>
        <CardTitle>Location</CardTitle>
        <CardDescription>Where are you ?</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="latitude">Latitude</Label>
            <FormField
            control={form.control}
            name="geolocation.latitude"
            render={({ field }) => (
              <FormItem>
              <FormControl>
                <Input placeholder="latitude" {...field} />
              </FormControl>
              <FormMessage />
              </FormItem>
            )}
            />
          </div>
          <div>
            <Label htmlFor="longitude">Longitude</Label>
            <FormField
            control={form.control}
            name="geolocation.longitude"
            render={({ field }) => (
              <FormItem>
              <FormControl>
                <Input placeholder="longitude" {...field} />
              </FormControl>
              <FormMessage />
              </FormItem>
            )}
            />
          </div>
        </div>
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
