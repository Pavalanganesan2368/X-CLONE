import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { baseUrl } from "../Constant/url";

const useFollow = () => {
  const queryClient = useQueryClient();
  const { mutate : toggleFollow, isPending } = useMutation({
    mutationFn : async (userId) => {
      try {
        const response = await fetch(`${baseUrl}/api/users/follow/${userId}`, {
          method : "POST",
          credentials : "include",
          headers : {
            "Content-Type" : "application/json"
          }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Something Went Wrong");
        return data;
      } catch (error) {
        throw error;
      }
    },

    onSuccess : () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey : ["suggestedUsers"] }),
        queryClient.invalidateQueries({ queryKey : ["authUser"] }),
        queryClient.invalidateQueries({ queryKey : ["profile"] })
      ]);
    },

    onError : (error) => {
      toast.error(error.message);
    }
  });

  return { toggleFollow, isPending };
}

export default useFollow;