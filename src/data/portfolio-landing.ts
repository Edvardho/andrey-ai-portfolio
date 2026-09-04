import type { CaseId } from './portfolio-index';
import { portfolioProfile } from './portfolio-profile';

export type LandingExperienceItem = {
  period: string;
  company: string;
  role: string;
};

export type LandingProjectItem = {
  id: CaseId;
  title: string;
  subtitle: string;
  result: string;
  resultTone: 'positive' | 'caution';
  rotation: number;
  image: {
    src: string;
    width: number;
    height: number;
    imageClassName: string;
  };
};

export const portfolioLanding = {
  name: portfolioProfile.name,
  role: portfolioProfile.role,
  description: portfolioProfile.description,
  tags: [portfolioProfile.experienceLabel, portfolioProfile.location, ...portfolioProfile.tags],
  experience: portfolioProfile.workHistory.map((item) => ({
    period: item.compactPeriod,
    company: item.company,
    role: item.role,
  })) satisfies LandingExperienceItem[],
  projects: [
    {
      id: 'alfa-smart',
      title: 'Альфа-Смарт',
      subtitle: 'Подписка на банковские продукты',
      result: '32 111 подписок за первый месяц,\n1,1 млн ₽ выручки',
      resultTone: 'positive',
      rotation: -6.85,
      image: {
        src: '/landing/projects/alfa-smart.png',
        width: 516,
        height: 950,
        imageClassName: 'absolute h-[99.51%] w-[35.77%] max-w-none left-[32.12%] top-[4.81%]',
      },
    },
    {
      id: 'expenses-card-holders',
      title: 'Расходы держателей',
      subtitle: 'Расходы для доп. держателей карт',
      result: 'Объединил 2 команды, запустил фичу',
      resultTone: 'positive',
      rotation: 4.26,
      image: {
        src: '/landing/projects/expenses-card-holders.png',
        width: 906,
        height: 1736,
        imageClassName: 'absolute h-[94.39%] w-[32.6%] max-w-none left-[33.7%] top-[9.44%]',
      },
    },
    {
      id: 'subscription-sharing',
      title: 'Шаринг подписки',
      subtitle: 'Приглашение участников',
      result: 'Добавление участника за 2 шага вместо 8 + ссылка вместо SMS',
      resultTone: 'positive',
      rotation: -2.67,
      image: {
        src: '/landing/projects/subscription-sharing.png',
        width: 900,
        height: 1747,
        imageClassName: 'absolute h-full w-[34.34%] max-w-none left-[32.83%] top-[5.15%]',
      },
    },
    {
      id: 'siebel',
      title: 'SIEBEL',
      subtitle: 'Интерфейс операторов поддержки',
      result: 'Сократил время диалога на 35%, 1000→2000 диалогов в обработке',
      resultTone: 'positive',
      rotation: 5.59,
      image: {
        src: '/landing/projects/siebel.png',
        width: 2380,
        height: 1520,
        imageClassName: 'absolute h-[87.92%] w-[91.1%] max-w-none left-[4.45%] top-[10.33%]',
      },
    },
    {
      id: 'chatpoint',
      title: 'ChatPoint',
      subtitle: 'Мессенджеры клиентов в одном интерфейсе',
      result: 'Долгий MVP, который не запустили',
      resultTone: 'caution',
      rotation: -4.38,
      image: {
        src: '/landing/projects/chatpoint.png',
        width: 2376,
        height: 1482,
        imageClassName: 'absolute h-[80.47%] w-[86.01%] max-w-none left-[5.5%] top-[19.53%]',
      },
    },
    {
      id: 'ux-ui-wannabelike',
      title: 'UX/UI WannabeLike',
      subtitle: 'Учебный кейс по UI',
      result: 'От интервью до макетов: полный продуктовый цикл',
      resultTone: 'positive',
      rotation: 0,
      image: {
        src: '/landing/projects/wannabelike.png',
        width: 941,
        height: 1672,
        imageClassName: 'absolute h-[106.33%] w-[39.9%] max-w-none left-[30.05%] top-[3.1%]',
      },
    },
  ] satisfies LandingProjectItem[],
};
