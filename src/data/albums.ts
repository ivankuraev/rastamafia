const covers = import.meta.glob("../assets/albums/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

function cover(name?: string): string | undefined {
  if (!name) return undefined;
  return Object.entries(covers).find(([p]) => p.endsWith("/" + name))?.[1];
}

export type Album = {
  id: string;
  title: string;
  year: string;
  type?: string;
  cover?: string;
  embed: string;
};

export const ALBUMS: Album[] = [
  {
    id: "everyone",
    title: "У всех на виду",
    year: "2024",
    type: "Сингл",
    cover: cover("2024-rgipb.png"),
    embed: "https://music.yandex.ru/iframe/album/32338631",
  },
  {
    id: "1000",
    title: "1000 (МЕЗЗА, Миша Крупин)",
    year: "2021",
    type: "Сингл",
    cover: cover("2021-1000.jpg"),
    embed: "https://music.yandex.ru/iframe/album/16553661",
  },
  {
    id: "helm",
    title: "Неважно, кто там у руля",
    year: "2018",
    cover: cover("2018-it-doesnt-matter-whos-at-the-helm.jpg"),
    embed: "https://music.yandex.ru/iframe/album/12540967",
  },
  {
    id: "acoustic",
    title: "Acoustic (feat. Animal ДжаZ)",
    year: "2018",
    cover: cover("2018-acoustic.jpg"),
    embed: "https://music.yandex.ru/iframe/album/12538515",
  },
  {
    id: "new-banger",
    title: "Новый бэнгер (Oligarkh)",
    year: "2018",
    type: "Сингл",
    cover: cover("2018-new-banger.jpg"),
    embed: "https://music.yandex.ru/iframe/album/12546991",
  },
  {
    id: "metempsychosis",
    title: "μετεμψύχωσις",
    year: "2017",
    cover: cover("2017-metempsychosis.jpg"),
    embed: "https://music.yandex.ru/iframe/album/12540425",
  },
  {
    id: "favela-outselect",
    title: "Favela Funk (Outselect)",
    year: "2017",
    type: "Сингл",
    cover: cover("2017-favela-funk-outselect-remix.jpg"),
    embed: "https://music.yandex.ru/iframe/album/38046110",
  },
  {
    id: "no-name",
    title: "No Name, No Game",
    year: "2017",
    type: "Сингл",
    cover: cover("2017-no-name-no-game.jpg"),
    embed: "https://music.yandex.ru/iframe/album/12540152",
  },
  {
    id: "favela",
    title: "Favela Funk",
    year: "2016",
    cover: cover("2016-favela-funk-ep.jpg"),
    embed: "https://music.yandex.ru/iframe/album/12553731",
  },
  {
    id: "jams",
    title: "Пробки, стройка, грязь",
    year: "2015",
    type: "Сингл",
    cover: cover("2015-jams-construction-dirt.jpg"),
    embed: "https://music.yandex.ru/iframe/album/3113274",
  },
  {
    id: "1033",
    title: "10:33 (feat. Al Bizzare)",
    year: "2015",
    type: "Сингл",
    cover: cover("2015-1033-al-bizzare.jpg"),
    embed: "https://music.yandex.ru/iframe/album/2877480",
  },
  {
    id: "mxxxiii",
    title: "MXXXIII",
    year: "2014",
    cover: cover("2014-mxxxiii.jpg"),
    embed: "https://music.yandex.ru/iframe/album/2128752",
  },
  {
    id: "dancehall",
    title: "Dancehall Mania",
    year: "2014",
    cover: cover("2014-dancehall-mania.jpg"),
    embed: "https://music.yandex.ru/iframe/album/1809655",
  },
  {
    id: "closet",
    title: "Шкаф",
    year: "2014",
    type: "Сингл",
    cover: cover("2014-closet.jpg"),
    embed: "https://music.yandex.ru/iframe/album/2431681",
  },
  {
    id: "here-now",
    title: "Здесь и сейчас",
    year: "2010",
    cover: cover("2010-here-and-now.jpg"),
    embed: "https://music.yandex.ru/iframe/album/1952334",
  },
  {
    id: "mosvegas",
    title: "MosVegas 2012",
    year: "2008",
    cover: cover("2008-mosvegas-2012.jpg"),
    embed: "https://music.yandex.ru/iframe/album/1952333",
  },
  {
    id: "le-truk",
    title: "Aka Le Truk",
    year: "2004",
    cover: cover("2004-aka-le-truk.jpg"),
    embed: "https://music.yandex.ru/iframe/album/1952336",
  },
  {
    id: "street-fighter",
    title: "Уличный боец",
    year: "2001",
    cover: cover("2001-street-fighter.jpg"),
    embed: "https://music.yandex.ru/iframe/album/2156956",
  },
  {
    id: "who",
    title: "Кто ты?",
    year: "2000",
    cover: cover("2000-who-are-you.jpg"),
    embed: "https://music.yandex.ru/iframe/album/1952332",
  },
];
