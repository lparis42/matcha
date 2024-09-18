import React, {useState} from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useSocket, Login } from "@/api/Socket"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { login } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

export function Component() {

  const { eventLogin } = useSocket();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof login>>({
    resolver: zodResolver(login),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  function onSubmit(values: z.infer<typeof login>) {
    eventLogin(values).then((res) => {
      if (!res.err)
        navigate("/browse")
    })
  }

  return (
    <div className="flex items-center justify-center h-screen">
            <Card className="mx-auto max-w-sm">
                <CardHeader>
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>
                    Enter your email below to login to your account
                </CardDescription>
                </CardHeader>
                <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-4">
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
                    Login
                    </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link to="/signup" className="underline">
                    Sign up
                    </Link>
                </div>
                </form>
                </Form>
                </CardContent>
            </Card>
        </div>
  )
}
