import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";
import { register } from "@/services/loginservice";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export function SignUp() {
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); 
  const [city, setCity] = useState(""); 
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleregister = async (e) => {
    e.preventDefault();
    try {
      const token = await register(username, email, password, city); 
      localStorage.setItem("token", token);
      navigate("/dashboard/home");
    } catch (error) {
      console.log("Registration failed");
      setError(error.message); 
    }
  };

  return (
    <section className="m-8 flex">
      <div className="w-2/5 h-full hidden lg:block">
        <img
          src="/img/pattern.png"
          className="h-full w-full object-cover rounded-3xl"
        />
      </div>
      <div className="w-full lg:w-3/5 flex flex-col items-center justify-center">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">Join Us Today</Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">Enter your details to register.</Typography>
        </div>
        <form className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2" onSubmit={handleregister}>
          <div className="mb-1 flex flex-col gap-6">
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Your username
            </Typography>
            <Input
              size="lg"
              placeholder="username"
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={!!error}
            />
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Your email
            </Typography>
            <Input
              size="lg"
              placeholder="name@mail.com"
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!error}
            />
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Password
            </Typography>
            <Input
              type="password"
              size="lg"
              placeholder="********"
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!error}
            />
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              City
            </Typography>
            <Input
              size="lg"
              placeholder="city"
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              error={!!error}
            />
          </div>
          
          {error && (
            <Typography variant="paragraph" color="red">
              {error}
            </Typography>
          )}

          <Button className="mt-6" fullWidth type="submit">
            Register Now
          </Button>

          <div className="space-y-4 mt-8">
            {/* Additional elements if needed */}
          </div>
          <Typography variant="paragraph" className="text-center text-blue-gray-500 font-medium mt-4">
            Already have an account?
            <Link to="/auth/sign-in" className="text-gray-900 ml-1">Sign in</Link>
          </Typography>
        </form>
      </div>
    </section>
  );
}

export default SignUp;
