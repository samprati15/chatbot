import * as Contacts from "expo-contacts";
import { Linking, Platform } from "react-native";

export interface ResolvedContact {
  name: string;
  phoneNumber: string;
}

export class CallingError extends Error {}

const PHONE_LIKE = /^[+\d][\d\s().-]{4,}$/;

/**
 * Resolves "call John" / "call +1 555 123 4567" into a name + number.
 * If the query already looks like a phone number, it's used directly —
 * no contacts permission needed for that path.
 */
export async function resolveCallTarget(query: string): Promise<ResolvedContact> {
  const trimmed = query.trim();
  if (PHONE_LIKE.test(trimmed)) {
    return { name: trimmed, phoneNumber: trimmed };
  }

  const { status } = await Contacts.requestPermissionsAsync();
  if (status !== "granted") {
    throw new CallingError(
      "Contacts permission was denied, so I can't look up names. Try saying the phone number instead, or allow contacts access in your device settings."
    );
  }

  const { data } = await Contacts.getContactsAsync({
    fields: [Contacts.Fields.PhoneNumbers],
    name: trimmed,
  });

  const match = data.find((c) => c.phoneNumbers && c.phoneNumbers.length > 0);
  if (!match || !match.phoneNumbers?.[0]?.number) {
    throw new CallingError(`I couldn't find a contact matching "${trimmed}" with a phone number.`);
  }

  return {
    name: match.name || trimmed,
    phoneNumber: match.phoneNumbers[0].number,
  };
}

/**
 * Opens the device's native dialer pre-filled with the number.
 *
 * Neither iOS nor Android lets a third-party app place a phone call
 * silently and autonomously — that's a deliberate OS-level restriction
 * to stop apps from dialing (and billing) on a person's behalf without
 * them touching anything. So "calling for you" means: the assistant
 * finds the number and opens the dialer ready to go — you tap Call.
 */
export async function openDialer(phoneNumber: string): Promise<void> {
  const url = Platform.select({
    ios: `telprompt:${phoneNumber}`,
    default: `tel:${phoneNumber}`,
  })!;

  const supported = await Linking.canOpenURL(url).catch(() => false);
  if (!supported) {
    throw new CallingError("This device can't open the phone dialer.");
  }
  await Linking.openURL(url);
}
