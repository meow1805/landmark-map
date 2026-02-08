import { createAvatar } from '@dicebear/core';
import { micah } from '@dicebear/collection';
import { CharacterConfig, HairColor, SkinTone, Gender } from '@/types/exhibit';
import { useMemo } from 'react';

interface CharacterAvatarProps {
  config: Partial<CharacterConfig>;
  size?: number;
  className?: string;
}

// Map hair colors to hex (without #) for DiceBear
const HAIR_COLOR_MAP: Record<HairColor, string> = {
  black: '2C3E50',
  brown: '6D4C2E',
  blonde: 'D4A537',
  red: 'B85C3A',
  gray: '9E9E9E',
  white: 'E0E0E0',
};

// Map skin tones to hex for DiceBear
const SKIN_COLOR_MAP: Record<SkinTone, string> = {
  light: 'FDEBD0',
  medium: 'F5CBA7',
  tan: 'E0A97F',
  brown: 'B07D5B',
  dark: '7B5539',
};

// Gender-aware clothing
const SHIRT_MAP: Record<string, Record<Gender, { shirt: string; color: string }>> = {
  pambahay: {
    male:   { shirt: 'open', color: '78909C' },
    female: { shirt: 'open', color: 'F48FB1' },
  },
  casual: {
    male:   { shirt: 'crew', color: '5C6BC0' },
    female: { shirt: 'crew', color: 'CE93D8' },
  },
  formal: {
    male:   { shirt: 'collared', color: '1A237E' },
    female: { shirt: 'collared', color: '7B1FA2' },
  },
  sporty: {
    male:   { shirt: 'open', color: 'E53935' },
    female: { shirt: 'open', color: '00ACC1' },
  },
};

export function CharacterAvatar({ config, size = 200, className = '' }: CharacterAvatarProps) {
  const gender = config.gender ?? 'male';
  const age = config.age ?? 25;
  const isFemale = gender === 'female';
  const conditions = config.conditions ?? [];

  const hairColor = HAIR_COLOR_MAP[config.hairColor ?? 'black'];
  const skinColor = SKIN_COLOR_MAP[config.skinTone ?? 'tan'];
  const hairStyle = config.hairStyle ?? (isFemale ? 'pixie' : 'fonze');
  const glassesStyle = config.glassesStyle ?? (conditions.includes('poor-eyesight') ? 'round' : 'none');
  const accessoryStyle = config.accessoryStyle ?? 'none';
  const clothingKey = config.clothingStyle ?? 'casual';
  const clothing = SHIRT_MAP[clothingKey]?.[gender] ?? SHIRT_MAP.casual[gender];

  // Face features based on gender & age
  const eyeStyle = isFemale ? 'smiling' : 'eyes';
  const eyebrowStyle = isFemale ? 'eyelashesUp' : 'up';
  const mouthStyle = age < 13 ? 'laughing' : (isFemale ? 'smile' : 'smirk');
  const noseStyle = isFemale ? 'round' : (age < 13 ? 'round' : 'pointed');

  const svgString = useMemo(() => {
    const options: Record<string, unknown> = {
      seed: `${gender}-${hairStyle}-${hairColor}-${skinColor}-${accessoryStyle}`,

      // Skin
      baseColor: [skinColor],

      // Hair
      hair: [hairStyle],
      hairColor: [hairColor],

      // Face features
      eyes: [eyeStyle],
      eyebrows: [eyebrowStyle],
      mouth: [mouthStyle],
      nose: [noseStyle],

      // Ears
      ears: ['attached'],

      // Earrings (built-in to micah style)
      earringsProbability: (accessoryStyle === 'hoop' || accessoryStyle === 'stud') ? 100 : 0,
      ...(accessoryStyle !== 'none' && { earrings: [accessoryStyle] }),
      earringColor: ['FFD700'],

      // Glasses (built-in to micah style)
      glassesProbability: glassesStyle !== 'none' ? 100 : 0,
      ...(glassesStyle !== 'none' && { glasses: [glassesStyle] }),
      glassesColor: ['47403B'],

      // Shirt
      shirt: [clothing.shirt],
      shirtColor: [clothing.color],

      // No facial hair
      facialHairProbability: 0,
    };

    return createAvatar(micah, options).toString();
  }, [gender, hairStyle, hairColor, skinColor, eyeStyle, eyebrowStyle, mouthStyle, noseStyle, accessoryStyle, glassesStyle, clothing.shirt, clothing.color]);

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Background circle */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle at 40% 30%, rgba(58,124,140,0.3), rgba(31,79,90,0.5))',
          border: '2px solid rgba(255,255,255,0.12)',
        }}
      />

      {/* Avatar (DiceBear Micah) */}
      <div
        className="rounded-full overflow-hidden [&>svg]:w-full [&>svg]:h-full"
        style={{ width: size, height: size }}
        dangerouslySetInnerHTML={{ __html: svgString }}
      />

      {/* Condition badges */}
      {conditions.length > 0 && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
          {conditions.slice(0, 4).map((cond) => {
            const icons: Record<string, string> = {
              'asthma': '🫁', 'arthritis': '🦴', 'heart-condition': '❤️',
              'chronic-fatigue': '😮‍💨', 'vertigo': '💫', 'heat-sensitivity': '🌡️',
              'poor-eyesight': '👓', 'mobility-impairment': '🦽',
            };
            return (
              <span
                key={cond}
                className="flex items-center justify-center w-5 h-5 rounded-full text-[9px] leading-none"
                style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {icons[cond] || '⚠️'}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
