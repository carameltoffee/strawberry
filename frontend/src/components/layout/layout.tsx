import Header from "../header/header";

type Props = {
     title: string;
     children: React.ReactNode;
     isAuthenticated: boolean;
     onLogout: () => void;
};

function isTokenValid(token: string | null): boolean {
     if (!token) return false;

     try {
          const payloadBase64 = token.split(".")[1];
          const decodedPayload = JSON.parse(atob(payloadBase64));
          const exp = decodedPayload.exp;
          if (!exp) return false;

          return exp * 1000 > Date.now();
     } catch {
          return false;
     }
}

const Layout: React.FC<Props> = ({ title, children, isAuthenticated, onLogout }) => {
     return (
          <>
          	<title>{__APP_NAME__}</title>
               <Header
                    title={title}
                    isAuthenticated={isAuthenticated}
                    onLogout={onLogout}
               />
               {children}
          </>
     );
};

export default Layout;
