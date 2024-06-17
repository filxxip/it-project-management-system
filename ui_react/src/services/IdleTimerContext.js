import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useCallback,
    useState,
  } from "react";
  import { useNavigate } from "@tanstack/react-router";
  import { api } from "../config/axiosConfig";
  
  const IdleTimerContext = createContext();
  
  export const useIdleTimer = () => useContext(IdleTimerContext);
  
  export const IdleTimerProvider = ({ children }) => {
    const navigate = useNavigate();
    const timerRef = useRef(null);
    const [isEnabled, setIsEnabled] = useState(true);
    const [timeLeft, setTimeLeft] = useState(1000);
    const [idleTimeout, setIdleTimeout] = useState(1000);
  
    const resetTimer = useCallback(
      (newTimeout) => {
        if (newTimeout) {
          setIdleTimeout(newTimeout);
          setTimeLeft(newTimeout / 1000);
        }
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
  
        if (isEnabled) {
          timerRef.current = setTimeout(async () => {
            await api.post("/user/logout");
            navigate({ to: "/start" });
          }, newTimeout || idleTimeout);
        }
      },
      [navigate, isEnabled, idleTimeout],
    );
  
    useEffect(() => {
      const fetchSettings = async () => {
        const response = await api.get("/setting");
        const settings = response.data;
        setIdleTimeout(settings.auto_logoff_time * 60 * 1000);
        setTimeLeft(settings.auto_logoff_time * 60);
        setIsEnabled(settings.auto_logoff_enabled);
      };
  
      fetchSettings();
    }, []);
  
    useEffect(() => {
      const events = ["mousemove", "mousedown", "click", "scroll", "keypress"];
  
      const resetAndLog = () => {
        resetTimer(idleTimeout);
      };
  
      events.forEach((event) => window.addEventListener(event, resetAndLog));
  
      resetTimer(idleTimeout);
  
      return () => {
        events.forEach((event) => window.removeEventListener(event, resetAndLog));
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }, [resetTimer, idleTimeout]); 
  
    useEffect(() => {
      const interval = setInterval(() => {
        if (isEnabled && timeLeft > 0) {
          setTimeLeft((prevTimeLeft) => prevTimeLeft - 1);
        }
      }, 1000);
  
      return () => clearInterval(interval);
    }, [isEnabled, timeLeft]);
  
    const toggleIdleTimer = () => {
      setIsEnabled((prevState) => !prevState);
      if (!isEnabled && timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  
    return (
      <IdleTimerContext.Provider
        value={{ isEnabled, toggleIdleTimer, timeLeft, resetTimer }}
      >
        {children}
      </IdleTimerContext.Provider>
    );
  };
  