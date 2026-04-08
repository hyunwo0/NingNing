// ==========================================
// 타로 카드 데이터 (메이저 아르카나 22장)
// ==========================================

export interface TarotCard {
  id: number;
  name: string;
  nameKo: string;
  keywords: string[];
}

export const MAJOR_ARCANA: TarotCard[] = [
  { id: 0, name: 'The Fool', nameKo: '바보', keywords: ['새로운 시작', '모험', '자유'] },
  { id: 1, name: 'The Magician', nameKo: '마법사', keywords: ['능력', '집중', '의지'] },
  { id: 2, name: 'The High Priestess', nameKo: '여사제', keywords: ['직감', '무의식', '신비'] },
  { id: 3, name: 'The Empress', nameKo: '여황제', keywords: ['풍요', '모성', '창조'] },
  { id: 4, name: 'The Emperor', nameKo: '황제', keywords: ['권위', '안정', '리더십'] },
  { id: 5, name: 'The Hierophant', nameKo: '교황', keywords: ['전통', '가르침', '신뢰'] },
  { id: 6, name: 'The Lovers', nameKo: '연인', keywords: ['선택', '사랑', '조화'] },
  { id: 7, name: 'The Chariot', nameKo: '전차', keywords: ['전진', '승리', '의지력'] },
  { id: 8, name: 'Strength', nameKo: '힘', keywords: ['내면의 힘', '인내', '용기'] },
  { id: 9, name: 'The Hermit', nameKo: '은둔자', keywords: ['성찰', '지혜', '고독'] },
  { id: 10, name: 'Wheel of Fortune', nameKo: '운명의 수레바퀴', keywords: ['변화', '전환점', '운명'] },
  { id: 11, name: 'Justice', nameKo: '정의', keywords: ['균형', '공정', '결단'] },
  { id: 12, name: 'The Hanged Man', nameKo: '매달린 사람', keywords: ['희생', '새 관점', '기다림'] },
  { id: 13, name: 'Death', nameKo: '죽음', keywords: ['변환', '끝과 시작', '재탄생'] },
  { id: 14, name: 'Temperance', nameKo: '절제', keywords: ['균형', '조화', '인내'] },
  { id: 15, name: 'The Devil', nameKo: '악마', keywords: ['유혹', '집착', '해방'] },
  { id: 16, name: 'The Tower', nameKo: '탑', keywords: ['급변', '파괴', '각성'] },
  { id: 17, name: 'The Star', nameKo: '별', keywords: ['희망', '영감', '평화'] },
  { id: 18, name: 'The Moon', nameKo: '달', keywords: ['불안', '환상', '무의식'] },
  { id: 19, name: 'The Sun', nameKo: '태양', keywords: ['성공', '기쁨', '활력'] },
  { id: 20, name: 'Judgement', nameKo: '심판', keywords: ['부활', '각성', '결산'] },
  { id: 21, name: 'The World', nameKo: '세계', keywords: ['완성', '성취', '통합'] },
];

export function getRandomCards(count: number): TarotCard[] {
  const shuffled = [...MAJOR_ARCANA].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
