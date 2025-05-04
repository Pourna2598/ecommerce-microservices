import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import Loader from "../components/Loader";
import { resetLoading } from "../store/slices/authSlice";
import { RootState } from "../store/store";

interface PrivateRouteProps {
    children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const { user, loading } = useSelector((state: RootState) => state.auth);
    const location = useLocation();
    const dispatch = useDispatch();
    const [loadingTimeout, setLoadingTimeout] = useState(false);

    useEffect(() => {
        if (loading) {
            // Set a timeout to prevent infinite loading
            const timer = setTimeout(() => {
                dispatch(resetLoading());
                setLoadingTimeout(true);
            }, 5000); // 5 seconds timeout

            return () => clearTimeout(timer);
        }
    }, [loading, dispatch]);

    if (loading && !loadingTimeout) {
        return <Loader />;
    }

    if (!user) {
        // Redirect to login page but save the location they were trying to access
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default PrivateRoute;
