import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Banner, Button, Chips, DateField, Field, Screen, ScreenHeader, Segmented, useToast, AppText } from '@/components';
import { categoryMeta } from '@/domain/labels';
import type { AssetCategory, AssetStatus } from '@/domain/types';
import { useBack } from '@/hooks/useBack';
import { useVault, repositoryMessage } from '@/state/vault';
import { space } from '@/theme';
import { formatINR } from '@/utils/format';
import { parseAmount } from '@/utils/validation';

export default function RegisterAsset() {
  const router = useRouter();
  const back = useBack();
  const toast = useToast();
  const { registerAsset } = useVault();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('property');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [acquired, setAcquired] = useState<Date | null>(null);
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<AssetStatus>('active');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const amount = parseAmount(value);

  const submit = async () => {
    const next = {
      name: name.trim().length < 2 ? 'Give the asset a name.' : undefined,
      location: location.trim() ? undefined : 'Say where it is kept or registered.',
      acquired: acquired ? undefined : 'Choose the date you acquired it.',
      value: amount ? undefined : 'Enter the declared value in rupees, like 18,40,000.',
    };
    setErrors(next);
    setSaveError(null);
    if (Object.values(next).some(Boolean) || !acquired || !amount) return;
    setSaving(true);
    try {
      const id = await registerAsset({
        name: name.trim(), category, location: location.trim(), description: description.trim(),
        acquiredOn: acquired.toISOString(), declaredValue: amount, status,
      });
      toast.show('Asset registered');
      router.replace(`/asset/${id}`);
    } catch (e) {
      setSaveError(repositoryMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen
      header={<ScreenHeader title="Register an asset" onBack={back} />}
      footer={<Button title="Register asset" onPress={submit} loading={saving} />}
    >
      <View style={{ paddingHorizontal: space.xl, gap: space.xl }}>
        {saveError ? <Banner tone="bad" title="Couldn’t register the asset" body={saveError} /> : null}
        <Field label="Asset name" value={name} onChangeText={setName} error={errors.name} placeholder="Harbour View, Flat 4B" autoCapitalize="words" />
        <View style={{ gap: 6 }}>
          <AppText variant="label" tone="soft">Category</AppText>
          <Chips wrap value={category} onChange={setCategory} options={(Object.keys(categoryMeta) as AssetCategory[]).map((c) => ({ value: c, label: categoryMeta[c].label }))} />
        </View>
        <Field label="Location or registration" value={location} onChangeText={setLocation} error={errors.location} placeholder="Where it is kept, or its registration number" />
        <DateField label="Acquired on" value={acquired} onChange={setAcquired} error={errors.acquired} maximumDate={new Date()} />
        <Field
          label="Declared value (₹)" value={value} onChangeText={setValue} error={errors.value} keyboardType="number-pad" placeholder="18,40,000"
          hint={amount ? formatINR(amount) : 'Your own estimate. It isn’t an appraisal.'}
        />
        <View style={{ gap: 6 }}>
          <AppText variant="label" tone="soft">Status</AppText>
          <Segmented value={status} onChange={setStatus} options={[{ value: 'active', label: 'Active' }, { value: 'pledged', label: 'Pledged as security' }]} />
        </View>
        <Field label="Notes (optional)" value={description} onChangeText={setDescription} multiline placeholder="Anything worth remembering about this asset" />
      </View>
    </Screen>
  );
}
