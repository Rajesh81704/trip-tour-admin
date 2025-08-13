"use client";
import LoginPage from "@/app/auth/login/page";
import { RootState, setUser, User } from "@/store/slice";
import { useDispatch, useSelector } from "react-redux";
import api from "@/lib/api";
import { useEffect, useState } from "react";

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      api
        .get("/admin/me")
        .then((res) => {
          if (res.status === 200) {
            dispatch(setUser(res.data as User));
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [user, dispatch]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-8 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-8 border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
