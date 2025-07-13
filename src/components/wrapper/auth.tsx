"use client";
import LoginPage from "@/app/auth/login/page";
import { RootState, setUser, User } from "@/store/slice";
import { useDispatch, useSelector } from "react-redux";
import api from "@/lib/api";

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();

  if (!user) {
    const response = api.get("/admin/me");
    response.then((res) => {
      if (res.status === 200) {
        dispatch(setUser(res.data as User));
      }
    });
    return <LoginPage />;
  } else {
    return <>{children}</>;
  }
}
