type AssistantIdentityInput = {
  itemIndex: number;
  hasPrecedingUser: boolean;
  presentationVariant: string;
  selectedContextKind: string;
};

export function shouldShowAssistantIdentity({
  itemIndex,
  hasPrecedingUser,
  presentationVariant,
  selectedContextKind,
}: AssistantIdentityInput) {
  const isDirectCanonicalCase =
    presentationVariant === 'case_summary' && selectedContextKind === 'case';
  const isDirectCanonicalExperience =
    presentationVariant === 'experience_summary' && selectedContextKind === 'experience';

  return !(
    itemIndex === 0
    && !hasPrecedingUser
    && (isDirectCanonicalCase || isDirectCanonicalExperience)
  );
}
