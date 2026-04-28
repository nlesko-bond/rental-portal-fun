/**
 * Schedule rows use `PublicResourceDto.type` from settings / expanded schedule.
 * Instructor-backed categories must send `instructorId` on `POST …/online-booking/create` segments, not `spaceId` alone.
 */
export function isInstructorScheduleResourceType(type: string | undefined): boolean {
  return (type ?? "").toLowerCase().includes("instructor");
}
