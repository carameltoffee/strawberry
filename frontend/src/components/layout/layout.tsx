import React from 'react';
import Header from '../header/header';

type Props = {
     title: string;
     children: React.ReactNode;
};

const Layout: React.FC<Props> = ({ title, children }) => {
     return (
          <>
          <Header title={title}></Header>
          {children}
          </>
     );
};

export default Layout;
