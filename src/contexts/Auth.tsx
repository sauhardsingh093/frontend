import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "../axios";

type ContextProps = {
  children: JSX.Element;
};

type User = {
  id: number;
  name: string;
  AadharNumber: string;
  Epic: string;
  mobile: string;
  admin: boolean;
};

export const AuthContext = createContext({
  id: 0,
  name: "",
  AadharNumber: "",
  Epic: "",
  mobile: "",
  isAdmin: false,
  authenticated: false,
  accessToken: "",
  loading: true,
  authenticate: (user: User, token: string) => {},
  logout: () => {},
});

export default (props: ContextProps): JSX.Element => {
  const navigate = useNavigate();

  const [authentication, setAuthentication] = useState({
    id: 0,
    name: "",
    AadharNumber: "",
    Epic: "",
    mobile: "",
    isAdmin: false,
    authenticated: false,
    accessToken: "",
    loading: true,
  });

  const checkAuthentication = () => {
    axios
      .post("/auth/check")
      .then((res) => authenticate(res.data.user, res.data.accessToken, false))
      .catch((error) => {
        console.log(error);
        setAuthentication({ ...authentication, loading: false });
      });
  };

  useEffect(() => {
    checkAuthentication();

    const interval = setInterval(checkAuthentication, 5 * 1000);

    return () => clearInterval(interval);
  }, []);

  const authenticate = (
    user: User,
    token: string,
    redirect: boolean = true
  ) => {
    setAuthentication({
      id: user.id,
      name: user.name,
      AadharNumber: user.AadharNumber,
      Epic: user.Epic,
      mobile: user.mobile,
      isAdmin: user.admin,
      authenticated: true,
      accessToken: token,
      loading: false,
    });

    if (redirect) navigate("/");
  }; 
  const logout = async () => {
    try {
      await axios.post("/auth/logout");
      await axios.post('/auth/otp', { 
        AadharNumber: authentication.AadharNumber,
        Epic: authentication.Epic, 
        OtpVerify: false 
      });
      
      setAuthentication({
        id: 0,
        name: "",
        AadharNumber: "",
        Epic: "",
        mobile: "",
        isAdmin: false,
        authenticated: false,
        accessToken: "",
        loading: false,
      });
  
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  }  

  return (
    <AuthContext.Provider
      value={{
        id: authentication.id,
        name: authentication.name, 
        AadharNumber: authentication.AadharNumber,
        Epic: authentication.Epic,
        mobile: authentication.mobile, 
        isAdmin: authentication.isAdmin,
        authenticated: authentication.authenticated,
        accessToken: authentication.accessToken,
        loading: authentication.loading,
        authenticate,
        logout,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};
