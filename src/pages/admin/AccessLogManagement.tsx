import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Eye, Settings, AlertTriangle, Clock, UserCheck } from "lucide-react";

interface AccessLog {
  id: string;
  user_id: string;
  property_id: string;
  room_id?: string;
  check_type: string;
  authentication_method: string;
  device_id?: string;
  timestamp: string;
  is_late_entry: boolean;
  notes?: string;
  profiles?: {
    full_name: string;
    email: string;
  } | null;
  properties?: {
    name: string;
  } | null;
  rooms?: {
    room_number: string;
  } | null;
}

interface PropertySetting {
  id: string;
  property_id: string;
  curfew_start_time: string;
  curfew_end_time: string;
  late_entry_notifications_enabled: boolean;
  notification_recipients: string[];
  properties?: {
    name: string;
  } | null;
}

interface Property {
  id: string;
  name: string;
}

export default function AccessLogManagement() {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertySettings, setPropertySettings] = useState<PropertySetting[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [selectedAuthMethod, setSelectedAuthMethod] = useState<string>("all");
  const [searchDate, setSearchDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [selectedPropertyForSettings, setSelectedPropertyForSettings] = useState<string>("");
  const [curfewStart, setCurfewStart] = useState("22:00");
  const [curfewEnd, setCurfewEnd] = useState("06:00");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationEmails, setNotificationEmails] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [selectedProperty, selectedAuthMethod, searchDate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch properties
       const propRes = await fetch("/api/accessLogs/properties");
      const propertiesData = await propRes.json();
      setProperties(propertiesData || []);

     // Fetch access logs with filters
      let query = `/api/accessLogs/logs?`;
      if (selectedProperty !== "all") query += `propertyId=${selectedProperty}&`;
      if (selectedAuthMethod !== "all") query += `authMethod=${selectedAuthMethod}&`;
      if (searchDate) query += `date=${searchDate}&`;

      const logRes = await fetch(query);
      const logsData = await logRes.json();
      setLogs(logsData || []);

      // Fetch property settings
      const settingsRes = await fetch("/api/accessLogs/settings");
      const settingsData = await settingsRes.json();
      setPropertySettings(settingsData || []);
       
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!selectedPropertyForSettings) return;

    try {
      const emailsList = notificationEmails
        .split(",")
        .map(email => email.trim())
        .filter(email => email);

      const res = await fetch("/api/accessLogs/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: selectedPropertyForSettings,
          curfew_start_time: curfewStart,
          curfew_end_time: curfewEnd,
          late_entry_notifications_enabled: notificationsEnabled,
          notification_recipients: emailsList,
        }),
      });

       const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings");

      toast({ title: "Success", description: "Property settings saved successfully" });
      setSettingsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openSettingsDialog = (propertyId: string) => {
    setSelectedPropertyForSettings(propertyId);
    
    const existingSettings = propertySettings.find(s => s.property_id === propertyId);
    if (existingSettings) {
      setCurfewStart(existingSettings.curfew_start_time);
      setCurfewEnd(existingSettings.curfew_end_time);
      setNotificationsEnabled(existingSettings.late_entry_notifications_enabled);
      setNotificationEmails(existingSettings.notification_recipients.join(", "));
    } else {
      setCurfewStart("22:00");
      setCurfewEnd("06:00");
      setNotificationsEnabled(true);
      setNotificationEmails("");
    }
    
    setSettingsDialogOpen(true);
  };

  const getAuthMethodBadge = (method: string) => {
    const variants = {
      face_recognition: "bg-blue-100 text-blue-800",
      fingerprint: "bg-green-100 text-green-800",
      smart_card: "bg-purple-100 text-purple-800",
      manual: "bg-gray-100 text-gray-800",
    };
    
    return (
      <Badge className={variants[method as keyof typeof variants]}>
        {method.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const getCheckTypeBadge = (type: string, isLate: boolean) => {
    const baseClass = type === "check_in" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
    const lateClass = isLate ? "bg-orange-100 text-orange-800" : baseClass;
    
    return (
      <div className="flex gap-1">
        <Badge className={baseClass}>
          {type === "check_in" ? "CHECK IN" : "CHECK OUT"}
        </Badge>
        {isLate && (
          <Badge className="bg-orange-100 text-orange-800">
            <Clock className="w-3 h-3 mr-1" />
            LATE
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Access Log Management</h1>
          <p className="text-muted-foreground">Monitor check-in/check-out activities and manage property settings</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="property-filter">Property</Label>
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger>
                  <SelectValue placeholder="All Properties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="auth-method-filter">Authentication Method</Label>
              <Select value={selectedAuthMethod} onValueChange={setSelectedAuthMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="All Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="face_recognition">Face Recognition</SelectItem>
                  <SelectItem value="fingerprint">Fingerprint</SelectItem>
                  <SelectItem value="smart_card">Smart Card</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-filter">Date</Label>
              <Input
                id="date-filter"
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                onClick={() => {
                  setSelectedProperty("all");
                  setSelectedAuthMethod("all");
                  setSearchDate("");
                }}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Property Curfew Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((property) => {
              const settings = propertySettings.find(s => s.property_id === property.id);
              return (
                <Card key={property.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{property.name}</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openSettingsDialog(property.id)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                  {settings ? (
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Curfew: {settings.curfew_start_time} - {settings.curfew_end_time}</p>
                      <p>Notifications: {settings.late_entry_notifications_enabled ? "Enabled" : "Disabled"}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-orange-600">No settings configured</p>
                  )}
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Access Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Access Logs
            {logs.filter(log => log.is_late_entry).length > 0 && (
              <Badge className="bg-orange-100 text-orange-800">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {logs.filter(log => log.is_late_entry).length} Late Entries
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Auth Method</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} className={log.is_late_entry ? "bg-orange-50" : ""}>
                    <TableCell>
                      {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{log.profiles?.full_name || "Unknown"}</p>
                        <p className="text-sm text-muted-foreground">{log.profiles?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{log.properties?.name}</TableCell>
                    <TableCell>{log.rooms?.room_number || "-"}</TableCell>
                    <TableCell>
                      {getCheckTypeBadge(log.check_type, log.is_late_entry)}
                    </TableCell>
                    <TableCell>
                      {getAuthMethodBadge(log.authentication_method)}
                    </TableCell>
                    <TableCell>{log.device_id || "-"}</TableCell>
                    <TableCell>{log.notes || "-"}</TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No access logs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Property Curfew Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="curfew-start">Curfew Start Time</Label>
              <Input
                id="curfew-start"
                type="time"
                value={curfewStart}
                onChange={(e) => setCurfewStart(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="curfew-end">Curfew End Time</Label>
              <Input
                id="curfew-end"
                type="time"
                value={curfewEnd}
                onChange={(e) => setCurfewEnd(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="notifications-enabled"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
              <Label htmlFor="notifications-enabled">Enable late entry notifications</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification-emails">Notification Recipients (comma-separated emails)</Label>
              <Textarea
                id="notification-emails"
                placeholder="admin@example.com, security@example.com"
                value={notificationEmails}
                onChange={(e) => setNotificationEmails(e.target.value)}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSettings}>
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}