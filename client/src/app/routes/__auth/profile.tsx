import React, {useEffect, useState} from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Component() {
    const [selectedFiles, setSelectedFiles] = useState([])
    const [preview, setPreview] = useState()

    const onSelectFile = e => {
      if (!e.target.files || e.target.files.length === 0) {
          setSelectedFiles([])
          return
      }

      setSelectedFiles(prevFiles => [...prevFiles, ...Array.from(e.target.files)]);
    }

    return (
      <main className="flex items-center justify-center p-6">
      <div className="grid gap-8">
      <Card>
      <CardHeader>
        <CardTitle>Personal Details</CardTitle>
        <CardDescription>Update your personal information here.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="gender">gender</Label>
            <Select id="sexual_orientation" defaultValue={"Male"}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="">
                      <SelectItem key={"Male"} value={"Male"}>
                        Male
                      </SelectItem>
                      <SelectItem key={"Women"} value={"Women"}>
                        Women
                      </SelectItem>
                      <SelectItem key={"Other"} value={"Other"}>
                        Other
                      </SelectItem>
                  </ScrollArea>
                </SelectContent>
              </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="sexual_orientation">sexual orientation</Label>
            <Select id="sexual_orientation" defaultValue={"hetero"}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="">
                      <SelectItem key={"hetero"} value={"hetero"}>
                        Hetero
                      </SelectItem>
                      <SelectItem key={"gay"} value={"gay"}>
                        Gay
                      </SelectItem>
                      <SelectItem key={"bi"} value={"bi"}>
                        Bi
                      </SelectItem>
                  </ScrollArea>
                </SelectContent>
              </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="biography">biography</Label>
            <Textarea id="biography" defaultValue="" />
          </div>
        </div>
      </CardContent>
      <CardHeader>
        <CardTitle>Profile Photo</CardTitle>
        <CardDescription>Update your profile photo here.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="flex flex-wrap gap-4">
          {selectedFiles.map((file, index) => (
            <div key={index}>
              <img src={URL.createObjectURL(file)} alt="Preview" className="w-32"/>
            </div>
          ))}
        </div>
          <div className="">
            <Label htmlFor="picture"></Label>
            <Input id="picture" type="file" onChange={onSelectFile} style={{ display: 'none' }}/>
            <Button onClick={() => document.getElementById('picture').click()}>Add picture</Button>
          </div>
      </CardContent>
      <CardFooter>
        <Button>Save Changes</Button>
      </CardFooter>
    </Card>
    </div>
    </main>
      )
}
