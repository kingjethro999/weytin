'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { LocationPicker } from '@/components/location/LocationPicker';
import { toast } from 'sonner';
import { normaliseError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';
import { UserCircle, MapPin, Building2, Pencil, Check, X } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  state: string;
  lga: string | null;
}

interface EditProfileClientProps {
  initialBusinessName: string | null;
  initialLocationId: string | null;
  initialLocation: Location | null;
}

export function EditProfileClient({
  initialBusinessName,
  initialLocationId,
  initialLocation,
}: EditProfileClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [businessName, setBusinessName] = useState(initialBusinessName ?? '');
  const [locationId, setLocationId] = useState(initialLocationId ?? '');
  const [location, setLocation] = useState<Location | null>(initialLocation);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName, locationId: locationId || null }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Update failed');
      }

      const updated = await res.json();
      setLocation(updated.location ?? null);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err: unknown) {
      const normalised = normaliseError(err);
      logger.error('[EditProfile] Save failed', { error: normalised.message });
      toast.error('Update failed', { description: normalised.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setBusinessName(initialBusinessName ?? '');
    setLocationId(initialLocationId ?? '');
    setLocation(initialLocation);
    setIsEditing(false);
  };

  return (
    <Card className="bg-card border-border/70">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="size-4 text-primary" />
            Edit Profile
          </CardTitle>
          <CardDescription>Update your business name and operating location.</CardDescription>
        </div>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 shrink-0"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="size-3.5" />
            Edit
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            {/* Business Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-businessName" className="flex items-center gap-2 text-xs">
                <Building2 className="size-3" />
                Business / Organization Name
              </Label>
              <Input
                id="edit-businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Lagos Supply Co."
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="edit-location" className="flex items-center gap-2 text-xs">
                <MapPin className="size-3" />
                Operating Location
              </Label>
              <LocationPicker
                id="edit-location"
                value={locationId}
                onChange={(val) => setLocationId(val)}
                placeholder="Select State and Local Government Area"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={isSaving} size="sm" className="gap-2">
                <Check className="size-3.5" />
                {isSaving ? 'Saving…' : 'Save Changes'}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isSaving} className="gap-2">
                <X className="size-3.5" />
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              Business Name:{' '}
              <span className="text-foreground font-medium">
                {businessName || <span className="italic text-muted-foreground">Not set</span>}
              </span>
            </p>
            <p>
              Location:{' '}
              <span className="text-foreground font-medium">
                {location
                  ? `${location.name}, ${location.state}${location.lga ? ` (${location.lga})` : ''}`
                  : <span className="italic text-muted-foreground">Not linked</span>
                }
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
