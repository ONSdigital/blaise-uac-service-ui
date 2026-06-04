import axios from "axios";

import axiosConfig from "../axiosConfig";
import { type AuditLog } from "../utils/auditLog.types";

export async function getAuditLogs(): Promise<AuditLog[]> {
  const response = await axios.get("/api/audit", axiosConfig());

  return response.data;
}
