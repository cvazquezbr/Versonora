import React from 'react';
import { Route, Redirect } from 'wouter';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ component: Component, ...rest }: any) => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <Route {...rest}>
      {(params) =>
        isAuthenticated() && isAdmin() ? (
          <Component {...params} />
        ) : (
          <Redirect to="/login" />
        )
      }
    </Route>
  );
};

export default PrivateRoute;
