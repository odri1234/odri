// src/pages/backup/BackupRestorePage.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Database, RefreshCw, Trash, RotateCcw, Clock } from "lucide-react";

export const BackupRestorePage = () => {
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/backup");
      const data = await res.json();
      setBackups(data);
    } catch (err: any) {
      setError("Failed to load backups");
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    setLoading(true);
    await fetch("/api/backup", { method: "POST" });
    await fetchBackups();
  };

  const restoreBackup = async (id: string) => {
    await fetch(`/api/backup/restore`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ backupId: id }),
    });
    alert("Restore started!");
  };

  const deleteBackup = async (id: string) => {
    await fetch(`/api/backup/${id}`, { method: "DELETE" });
    await fetchBackups();
  };

  const scheduleBackup = async () => {
    if (!schedule) return alert("Please enter a cron expression");
    await fetch(`/api/backup/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "CRON", cronExpression: schedule }),
    });
    alert("Backup scheduled!");
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Backup & Restore</h1>
        <p className="text-muted-foreground">Manage system backups and restoration</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Backup Actions
          </CardTitle>
          <CardDescription>Manage your backups</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={createBackup} disabled={loading}>
            {loading && <RefreshCw className="h-4 w-4 animate-spin mr-2" />}
            Create Backup
          </Button>

          <div className="flex items-center gap-2">
            <Input
              placeholder="Cron expression"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
            />
            <Button onClick={scheduleBackup} variant="secondary">
              <Clock className="h-4 w-4 mr-1" /> Schedule
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Backups</CardTitle>
          <CardDescription>Restore or delete backups</CardDescription>
        </CardHeader>
        <CardContent>
          {backups.length === 0 ? (
            <p className="text-muted-foreground">No backups found</p>
          ) : (
            <ul className="space-y-2">
              {backups.map((b) => (
                <li
                  key={b.id}
                  className="flex justify-between items-center border p-3 rounded-md"
                >
                  <div>
                    <p className="font-semibold">{b.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(b.createdAt).toLocaleString()} • {(b.fileSize / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => restoreBackup(b.id)}
                      variant="secondary"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" /> Restore
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => deleteBackup(b.id)}
                      variant="destructive"
                    >
                      <Trash className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default BackupRestorePage;
