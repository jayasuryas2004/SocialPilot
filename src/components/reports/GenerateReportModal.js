"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { REPORT_CATEGORIES } from "@/constants/reportStatus";

export default function GenerateReportModal({ open, onOpenChange, onGenerate }) {
  const [category, setCategory] = useState("engagement");
  const [format, setFormat] = useState("pdf");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    // Basic validation
    if (!startDate || !endDate) {
      setError("Please select both a start and end date.");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // 1. Call your parent function (e.g., to log the generation to the DB)
      if (onGenerate) {
        await onGenerate({ category, format, startDate, endDate });
      }

      // 2. PHYSICAL DOWNLOAD MOCK
      // When your backend is ready, replace 'fileContent' with the real file stream/blob from your API
      const fileContent = `SocialPilot Analytics Report\n\nCategory: ${category}\nStart Date: ${startDate}\nEnd Date: ${endDate}\nFormat: ${format}\n\n[Report Data Payload...]`;
      
      const blob = new Blob([fileContent], { type: "text/plain" }); 
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      // Set dynamic file name based on category and timestamp
      link.download = `socialpilot_${category}_report_${new Date().getTime()}.${format}`;
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup the DOM
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      // 3. Close modal on success
      onOpenChange(false);
    } catch (err) {
      setError(err.message || "Couldn't start report generation");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Generate report</DialogTitle></DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {REPORT_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start date</Label>
              <Input type="date" className="mt-1" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label>End date</Label>
              <Input type="date" className="mt-1" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || !startDate || !endDate}>
            {loading ? "Generating..." : "Generate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}