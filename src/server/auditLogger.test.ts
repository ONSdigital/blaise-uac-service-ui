import AuditLogger from "./auditLogger.js";

const { getEntriesMock, logMock } = vi.hoisted(() => {
  const getEntriesMock = vi.fn();
  const logMock = vi.fn((_name: string) => ({ getEntries: getEntriesMock }));

  return { getEntriesMock, logMock };
});

vi.mock("@google-cloud/logging", () => ({
  Logging: class {
    log(name: string) {
      return logMock(name);
    }
  },
}));

describe("AuditLogger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("writes AUDIT_LOG prefixes for info and error", () => {
    const auditLogger = new AuditLogger("project-1");
    const logger = { info: vi.fn(), error: vi.fn() };

    auditLogger.info(logger as never, "something happened");
    auditLogger.error(logger as never, "something failed");

    expect(logger.info).toHaveBeenCalledWith({ auditMessage: "something happened" }, "AUDIT_LOG:");
    expect(logger.error).toHaveBeenCalledWith({ auditMessage: "something failed" }, "AUDIT_LOG:");
  });

  it("sanitises audit messages before logging", () => {
    const auditLogger = new AuditLogger("project-1");
    const logger = { info: vi.fn(), error: vi.fn() };

    auditLogger.info(logger as never, "alice uploaded file\nAUDIT_LOG: forged");
    auditLogger.error(logger as never, "bob failed\r\nAUDIT_LOG: forged");

    expect(logger.info).toHaveBeenCalledWith(
      { auditMessage: "alice uploaded file AUDIT_LOG: forged" },
      "AUDIT_LOG:",
    );
    expect(logger.error).toHaveBeenCalledWith(
      { auditMessage: "bob failed AUDIT_LOG: forged" },
      "AUDIT_LOG:",
    );
  });

  it("retrieves and maps logs with bus-ui filter", async () => {
    getEntriesMock.mockResolvedValueOnce([
      [
        {
          metadata: {
            insertId: "abc",
            timestamp: new Date("2026-06-04T12:00:00.000Z"),
            severity: "ERROR",
          },
          data: {
            message: "AUDIT_LOG:",
            auditMessage: "rich failed to upload sample file x.csv",
          },
        },
        {
          metadata: {},
          data: {},
        },
      ],
    ]);

    const auditLogger = new AuditLogger("project-2");
    const logs = await auditLogger.getLogs();

    expect(logMock).toHaveBeenCalledWith("projects/project-2/logs/stdout");
    expect(getEntriesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        maxResults: 50,
      }),
    );

    const filter = getEntriesMock.mock.calls[0][0].filter as string;

    expect(filter).toContain('resource.type="gae_app"');
    expect(filter).toContain('resource.labels.module_id="bus-ui"');
    expect(filter).toContain('jsonPayload.message:"AUDIT_LOG:"');

    expect(logs[0]).toMatchObject({
      id: "abc",
      timestamp: expect.stringContaining("2026"),
      message: "rich failed to upload sample file x.csv",
      severity: "ERROR",
    });
    expect(logs[1]).toStrictEqual({
      id: "",
      timestamp: "",
      message: "",
      severity: "INFO",
    });
  });

  it("reads auditMessage from nested info payload", async () => {
    getEntriesMock.mockResolvedValueOnce([
      [
        {
          metadata: {
            insertId: "nested",
            timestamp: "2026-06-10T11:00:00.000Z",
            severity: "INFO",
          },
          data: {
            message: "AUDIT_LOG:",
            info: {
              auditMessage: "rich disabled UAC for alex",
            },
          },
        },
      ],
    ]);

    const auditLogger = new AuditLogger("project-2");
    const [entry] = await auditLogger.getLogs();

    expect(entry).toMatchObject({
      id: "nested",
      message: "rich disabled UAC for alex",
      severity: "INFO",
    });
  });

  it("falls back to msg key when message key is absent", async () => {
    getEntriesMock.mockResolvedValueOnce([
      [
        {
          metadata: {
            insertId: "msg-key",
            timestamp: "2026-06-10T11:00:00.000Z",
            severity: "INFO",
          },
          data: {
            msg: "AUDIT_LOG: enabled UAC for alex",
          },
        },
      ],
    ]);

    const auditLogger = new AuditLogger("project-2");
    const [entry] = await auditLogger.getLogs();

    expect(entry).toMatchObject({
      id: "msg-key",
      message: "enabled UAC for alex",
      severity: "INFO",
    });
  });
});
