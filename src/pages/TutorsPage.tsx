import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function TutorsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/admin/mentors", { replace: true });
  }, [navigate]);

  return null;
}
