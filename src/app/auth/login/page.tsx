"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { setUser, User } from "@/store/slice";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { toast } from "sonner";
import api from "@/lib/api";

interface LoginForm {
  identifier: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<LoginForm>();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      const response = await api.post("/auth/admin/login", {
        identifier: data.identifier,
        password: data.password,
      });
      if (response.status === 200) {
        toast.success("Admin login successful!");
        dispatch(setUser(response.data as User));
        router.push("/");
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      toast.error(err.response?.data?.message || err.message || "Invalid credentials or login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-slate-950 px-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-slate-100 shadow-2xl">
        <CardHeader className="text-center space-y-2 pb-6 border-b border-slate-800">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xl mb-2">
            TT
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            Triptoo Travels
          </CardTitle>
          <p className="text-sm text-slate-400">
            Admin Dashboard Access
          </p>
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
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
