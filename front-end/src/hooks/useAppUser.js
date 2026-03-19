import {useState, useEffect} from "react";
import api from "../api";
import useUser from "./useUser";

const useAppUser = () => { 
    const { isLoading: firebaseIsLoading, user: firebaseUser } = useUser();
    const [appUser, setAppUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if(firebaseIsLoading) return; //Wait for Firebase

        if(!firebaseUser) {
            setAppUser(null);
            setIsLoading(false);
            return;
        }

        const fetchUser = async () => {
            const res = await api.get(`/user`);
            setAppUser(res.data);
            setIsLoading(false);
        };
        fetchUser();
    }, [firebaseIsLoading, firebaseUser]);

    return { isLoading, appUser };
}

export default useAppUser;