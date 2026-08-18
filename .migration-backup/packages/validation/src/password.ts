export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

export const PASSWORD_RULES_MESSAGE =
	"Password must be 12–128 characters and include uppercase, lowercase, number, and special character.";

const PASSWORD_RULES = [
	/[a-z]/,
	/[A-Z]/,
	/[0-9]/,
	/[^A-Za-z0-9]/,
] as const;

export function isStrongPassword(password: string): boolean {
	return (
		password.length >= PASSWORD_MIN_LENGTH &&
		password.length <= PASSWORD_MAX_LENGTH &&
		PASSWORD_RULES.every((rule) => rule.test(password))
	);
}