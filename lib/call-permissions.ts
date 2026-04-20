import { Platform } from 'react-native';
import {
  PERMISSIONS,
  RESULTS,
  openSettings,
  requestMultiple,
  type Permission,
  type PermissionStatus,
} from 'react-native-permissions';

type PermissionKind = 'camera' | 'microphone';

export type CallPermissionSummary = {
  blockedPermissions: PermissionKind[];
  cameraStatus: PermissionStatus;
  hasCameraPermission: boolean;
  hasMicrophonePermission: boolean;
  microphoneStatus: PermissionStatus;
};

function isGranted(status: PermissionStatus) {
  return status === RESULTS.GRANTED || status === RESULTS.LIMITED;
}

function formatPermissionNames(permissionKinds: PermissionKind[]) {
  if (permissionKinds.length === 1) {
    return permissionKinds[0];
  }

  if (permissionKinds.length === 2) {
    return `${permissionKinds[0]} and ${permissionKinds[1]}`;
  }

  return permissionKinds.join(', ');
}

function getPermissionList() {
  if (Platform.OS === 'ios') {
    return [PERMISSIONS.IOS.CAMERA, PERMISSIONS.IOS.MICROPHONE] satisfies Permission[];
  }

  if (Platform.OS === 'android') {
    const permissions: Permission[] = [PERMISSIONS.ANDROID.CAMERA, PERMISSIONS.ANDROID.RECORD_AUDIO];

    if (typeof Platform.Version === 'number' && Platform.Version >= 31) {
      permissions.push(PERMISSIONS.ANDROID.BLUETOOTH_CONNECT);
    }

    return permissions;
  }

  return [];
}

export function getCallPermissionMessage(summary: CallPermissionSummary) {
  const deniedPermissions: PermissionKind[] = [];

  if (!summary.hasCameraPermission) {
    deniedPermissions.push('camera');
  }

  if (!summary.hasMicrophonePermission) {
    deniedPermissions.push('microphone');
  }

  if (deniedPermissions.length === 0) {
    return null;
  }

  const formattedPermissions = formatPermissionNames(deniedPermissions);

  if (summary.blockedPermissions.length > 0) {
    return `${formattedPermissions} access is blocked. Open Settings to enable full call controls.`;
  }

  return `${formattedPermissions} access was not granted. You can still join, but publishing may stay unavailable.`;
}

export async function requestCallPermissions(): Promise<CallPermissionSummary> {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return {
      blockedPermissions: [],
      cameraStatus: RESULTS.GRANTED,
      hasCameraPermission: true,
      hasMicrophonePermission: true,
      microphoneStatus: RESULTS.GRANTED,
    };
  }

  const permissionResults = await requestMultiple(getPermissionList());
  const cameraPermission =
    Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
  const microphonePermission =
    Platform.OS === 'ios' ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO;
  const cameraStatus = permissionResults[cameraPermission] ?? RESULTS.UNAVAILABLE;
  const microphoneStatus = permissionResults[microphonePermission] ?? RESULTS.UNAVAILABLE;
  const blockedPermissions: PermissionKind[] = [];

  if (cameraStatus === RESULTS.BLOCKED) {
    blockedPermissions.push('camera');
  }

  if (microphoneStatus === RESULTS.BLOCKED) {
    blockedPermissions.push('microphone');
  }

  return {
    blockedPermissions,
    cameraStatus,
    hasCameraPermission: isGranted(cameraStatus),
    hasMicrophonePermission: isGranted(microphoneStatus),
    microphoneStatus,
  };
}

export function openCallPermissionSettings() {
  return openSettings();
}
