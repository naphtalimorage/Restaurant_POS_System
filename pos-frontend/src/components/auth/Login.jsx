import { useState } from "react";
import { useMutation } from "@tanstack/react-query"
import { enqueueSnackbar } from "notistack";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../config/supabase";

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const[formData, setFormData] = useState({
      email: "",
      password: "",
    });
  
    const handleChange = (e) => {
      setFormData({...formData, [e.target.name]: e.target.value});
    }

  
    const handleSubmit = (e) => {
      e.preventDefault();
      loginMutation.mutate(formData);
    }

    const loginMutation = useMutation({
      mutationFn: async (reqData) => {
        const { email, password } = reqData;
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        return data;
      },
      onSuccess: async (data) => {
        try {
          // Get user profile from Supabase users table
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', formData.email)
            .single();
            
          if (error) throw error;
          
          // Set user in Redux store
          const { id, name, email, phone, role } = userData;
          dispatch(setUser({ _id: id, name, email, phone, role }));
          
          enqueueSnackbar("Login successful!", { variant: "success" });
          navigate("/");
        } catch (error) {
          console.error("Error fetching user data:", error);
          enqueueSnackbar("Login successful but error fetching user data", { variant: "warning" });
          navigate("/");
        }
      },
      onError: (error) => {
        console.error("Login error:", error);
        enqueueSnackbar(error.message || "Login failed", { variant: "error" });
      }
    })

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
            Employee Email
          </label>
          <div className="flex item-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter employee email"
              className="bg-transparent flex-1 text-white focus:outline-none"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
            Password
          </label>
          <div className="flex item-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="bg-transparent flex-1 text-white focus:outline-none"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg mt-6 py-3 text-lg bg-yellow-400 text-gray-900 font-bold"
        >
          Sign in
        </button>
      </form>
    </div>
  );
};

export default Login;