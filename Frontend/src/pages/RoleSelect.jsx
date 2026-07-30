import { useNavigate } from "react-router-dom";

export default function RoleSelect() {
  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.value;

    console.log("Selected:", value); // 👈 CHECK THIS FIRST

     if (value !== "") {
      navigate("/login");
    }
  };

  return (
    <div>
      <h2>Select Role</h2>

      <select onChange={handleChange}>
        <option value="">-- Select Role --</option>
        <option value="applier">Applier</option>
        <option value="staff">Staff Officer</option>
        <option value="branch">Branch Manager</option>
        <option value="bgrade">B Grade Officer</option>
        <option value="agrade">A Grade Officer</option>
      </select>
    </div>
  );
}