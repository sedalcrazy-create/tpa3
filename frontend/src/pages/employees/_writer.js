const fs = require("fs");
const target = "E:/project/tpa3/frontend/src/pages/employees/EmployeeCreatePage.tsx";
const lines = [];

lines.push("import { useForm, Controller } from "react-hook-form";");
lines.push("import { zodResolver } from "@hookform/resolvers/zod";");
lines.push("import { z } from "zod";");
lines.push("import { useNavigate } from "react-router-dom";");
lines.push("import { useMutation } from "@tanstack/react-query";");
lines.push("import toast from "react-hot-toast";");
lines.push("");
lines.push("import FormField from "../../components/ui/FormField";");
lines.push("import SelectField from "../../components/ui/SelectField";");
lines.push("import DatePicker from "../../components/ui/DatePicker";");
lines.push("import FileUpload from "../../components/ui/FileUpload";");
lines.push("import Button from "../../components/ui/Button";");

fs.writeFileSync(target, lines.join("
") + "
");
console.log("Phase 1 done");