import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Loader from "../components/Loader";
import { resetLoading } from "../store/slices/authSlice";
import { RootState } from "../store/store";

interface AdminRouteProps {
    children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { user, loading } = useSelector((state: RootState) => state.auth);
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

    if (!user || !user.isAdmin) {
        // If not logged in or not admin, redirect to home page
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;
