import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function Component() {
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
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" defaultValue="John" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" defaultValue="Doe" />
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" defaultValue="john@example.com" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" defaultValue="+1 (555) 555-5555" />
        </div>
      </CardContent>
      <CardFooter>
        <Button>Save Changes</Button>
      </CardFooter>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
        <CardDescription>Update your contact details here.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="space-y-1">
          <Label htmlFor="address">Address</Label>
          <Textarea id="address" rows={3} defaultValue="123 Main St, Anytown USA" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="city">City</Label>
            <Input id="city" defaultValue="Anytown" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="state">State</Label>
            <Input id="state" defaultValue="CA" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="zip">Zip</Label>
            <Input id="zip" defaultValue="12345" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="country">Country</Label>
            <Input id="country" defaultValue="United States" />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button>Save Changes</Button>
      </CardFooter>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Profile Photo</CardTitle>
        <CardDescription>Update your profile photo here.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="relative h-32 w-32 overflow-hidden rounded-full">
          <img src="/placeholder.svg" alt="Profile Photo" fill className="object-cover" />
        </div>
        <Button variant="outline">Change Photo</Button>
      </CardContent>
    </Card>
    </div>
    </main>
      )
}
