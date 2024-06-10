import React, {useState} from "react";
import Signup from "@/components/Signup";
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


export function Component() {
  console.log("Signup");s

    const { eventRegistration } = useSocket();

    const [data, setData] = useState<Register>({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        username: "",
        //date_of_birth: new Date(),
    });

    const handleChange = (e) => {
        setData({
          ...data,
          [e.target.id]: e.target.value
        });
      }

    const handleDateChange = (date: Date) => {
      setData({
        ...data,
        date_of_birth: date
      });
    }

    const handleSubmit = () => {
        console.log(data);
        eventRegistration(data);
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
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="first-name">First name</Label>
                  <Input id="first_name" placeholder="Max" value={data.first_name} onChange={(e) => handleChange(e)} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input id="last_name" placeholder="Robinson" value={data.last_name} onChange={(e) => handleChange(e)} required />
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
                  required
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
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="birthday">Birthday</Label>
                {/*<DatePicker id="date_of_birth" date={data.date_of_birth} setDate={handleDateChange}/>*/}
              </div>
              <Button type="submit" className="w-full" onClick={() => {handleSubmit()}}>
                Create an account
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link to='/signin' className="underline" >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
        </div>
    )
  }
