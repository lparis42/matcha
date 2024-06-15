import React, {useState} from "react";
import { Register, useSocket } from "@/api/Socket";

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { DatePicker } from '@/components/ui/datepicker'
import { Link } from 'react-router-dom'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { register } from "@/types";


export function Component() {

    const { eventRegistration } = useSocket();

    const form = useForm<z.infer<typeof register>>({
      resolver: zodResolver(register),
      defaultValues: {
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        username: "",
      },
    })
   
    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof register>) {
      // Do something with the form values.
      // ✅ This will be type-safe and validated.
      console.log(values)
      eventRegistration(values);
    }

    return (
      <div className="flex items-center justify-center h-screen">
            <Card className="mx-auto max-w-sm">
              <CardHeader>
                <CardTitle className="text-xl">Sign Up</CardTitle>
                <CardDescription>
                  Enter your information to create an account
                </CardDescription>
              </CardHeader>
              <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="grid gap-4">
                    <div className="flex gap-2">
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
                    </div>
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
                    <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                    />
                  <Button type="submit" className="w-full">
                    Create an account
                  </Button>
                  </div>
                  <div className="mt-4 text-center text-sm">
                    Already have an account?{" "}
                    <Link to='/signin' className="underline" >
                      Sign in
                    </Link>
                  </div>
                </form>
              </Form>
              </CardContent>
            </Card>
        </div>
    )
  }

  {/*<div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="first-name">First name</Label>
                      <FormControl>
                        <Input id="first_name" placeholder="Max" {form.}/>{/*value={data.first_name} onChange={(e) => handleChange(e)}
                      </FormControl>
                      <FormMessage />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="last-name">Last name</Label>
                      <Input id="last_name" placeholder="Robinson" value={data.last_name} onChange={(e) => handleChange(e)}/>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      value={data.email}
                      onChange={(e) => handleChange(e)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={data.password} onChange={(e) => handleChange(e)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="username"
                      placeholder="username"
                      value={data.username}
                      onChange={(e) => handleChange(e)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="birthday">Birthday</Label>
                    {/*<DatePicker id="date_of_birth" date={data.date_of_birth} setDate={handleDateChange}/>onClick={() => {}}handleSubmit()
                  </div>*/}
