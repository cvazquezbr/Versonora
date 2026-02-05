import React from 'react';
import { Route, Redirect } from 'wouter';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  component: React.ComponentType<any>;
  path: string;
  requireAdmin?: boolean;
}

const PrivateRoute = ({ component: Component, requireAdmin = false, ...rest }: PrivateRouteProps) => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <Route {...rest}>
      {(params) => {
        if (!isAuthenticated()) {
          return <Redirect to="/login" />;
        }

        if (requireAdmin && !isAdmin()) {
          return <Redirect to="/" />;
        }

        return <Component {...params} />;
      }}
    </Route>
  );
};

export default PrivateRoute;
