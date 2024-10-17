import React, {useEffect, useState} from "react"
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
import { AuthStatus, useAuth } from "@/hook/useAuth"
import { toast } from "@/components/ui/use-toast"

export function Component() {

  const { status } = useAuth();
  const { eventLogin, eventPasswordReset } = useSocket();
  const navigate = useNavigate();

  useEffect(()=>{
    if (status === AuthStatus.Authenticated)
      navigate("/browse")
  }, [status])

  const form = useForm<z.infer<typeof login>>({
    resolver: zodResolver(login),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  function onSubmit(values: z.infer<typeof login>) {
    eventLogin(values).then((res) => {
      if (!res[0])
        navigate("/browse")
    })
  }

  const {getValues} = form

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
                          <Input type="password" autoComplete="current-password" {...field} />
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
                <Button className="w-full" onClick={()=>{
                  const email = getValues('email')
                  if (!email)
                    toast({title: "first type your email in the field Email"})
                  else
                    eventPasswordReset(email)
                  }}> Reset Password </Button>
                </Form>

                </CardContent>
            </Card>
        </div>
  )
}
