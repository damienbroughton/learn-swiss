import {useState, useEffect} from "react";
import axios from "axios";
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
            const token = await firebaseUser.getIdToken();
            const headers = token ? { authtoken: token } : {};
            const res = await axios.get(`/api/user`, { headers });
            setAppUser(res.data);
            setIsLoading(false);
        };
        fetchUser();
    }, [firebaseIsLoading, firebaseUser]);

    return { isLoading, appUser };
}

export default useAppUser;