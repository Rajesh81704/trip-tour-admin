"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { setUser, User } from "@/store/slice";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import api from "@/lib/api";

interface LoginForm {
  identifier: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<LoginForm>();
  const dispatch = useDispatch();
  const onSubmit = async (data: LoginForm) => {
    const response = await api.post("/auth/admin/login", {
      identifier: data.identifier,
      password: data.password,
    });
    if (response.status === 200) {
      dispatch(setUser(response.data as User));
      router.push("/");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card>
        <CardHeader>
          <CardTitle>
            Login to dashboard
            <br />
            <span className="text-sm text-gray-500">
              Username: admin
              <br />
              Password: admin@123
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <FormItem>
                <FormLabel>Username or Email</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Username or Email"
                    {...form.register("identifier")}
                  />
                </FormControl>
              </FormItem>
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Password"
                    {...form.register("password")}
                  />
                </FormControl>
              </FormItem>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
