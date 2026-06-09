import axios from "axios";

import { type AuditLog } from "../types/auditLog.types";

import axiosConfig from "./axiosConfig";

export async function getAuditLogs(): Promise<AuditLog[]> {
  const response = await axios.get("/api/audit", axiosConfig());

  return response.data;
}
