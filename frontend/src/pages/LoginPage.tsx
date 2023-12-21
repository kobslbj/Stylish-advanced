import { useState } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import LoginForm from "../components/login/LoginForm";
import SignupForm from "../components/login/SignupForm";

const LoginPage: React.FC = () => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="lg:pt-[8.875rem] pt-[6.375rem] flex-1">
        {showLogin ? (
          <LoginForm setShowLogin={setShowLogin} showLogin={showLogin} />
        ) : (
          <SignupForm setShowLogin={setShowLogin} showLogin={showLogin} />
        )}
      </div>
      <Footer />
    </div>
  );
};
export default LoginPage;
