import { BUKKEN_CATEGORY_LABEL, MANAGEMENT_TYPE } from '@/constants/kbn'
import { wareki, yen, type getContractData } from '@/features/queries/contract'
import { E, T, H, D, SectionTitle } from '@/components/contract/ContractParts'
import { CheckMark } from '@/components/contract/CheckMark'

// 契約書の頭書(住居用・店舗用)の中身。印刷されるのはここ。
export type Data = Awaited<ReturnType<typeof getContractData>>

// ---------- 共通部分 ----------
function Lead({ d, title }: { d: Data; title: string }) {
  const lessor = d.bukken.management_type === MANAGEMENT_TYPE.OWN ? d.orgName : d.cf('貸主', '貸主氏名', 'オーナー', 'オーナー名')
  return (
    <>
      <h1 className="mb-4 text-center text-xl font-bold tracking-widest">{title}</h1>
      <p className="text-[12px] leading-relaxed">
        貸主 <E v={lessor} minW="10em" className="border-b border-slate-700" />(以下「甲」という。)と
        借主 <E v={d.tenancy?.tenant_name} minW="10em" className="border-b border-slate-700" />(以下「乙」という。)は、
        この契約書により頭書に表示する不動産に関する賃貸借契約を締結した。
      </p>
    </>
  )
}

function Period({ d, no }: { d: Data; no: string }) {
  const start = wareki(d.tenancy?.move_in_date)
  return (
    <>
      <SectionTitle>頭書({no}) 契約期間</SectionTitle>
      <T>
        <tr>
          <D colSpan={2}>
            <div className="flex flex-wrap items-center justify-around gap-2">
              <span><E v={start ?? d.cf('契約開始日', '契約始期')} minW="9em" /> から</span>
              <span><E v={d.cf('契約終了日', '契約終期', '契約満了日')} minW="9em" /> まで</span>
              <span>( <E v={d.cf('契約期間')} minW="3em" /> 間 )</span>
            </div>
          </D>
        </tr>
        <tr>
          <H className="w-1/3">目的物件の引渡し時期</H>
          <D v={start ?? d.cf('引渡し時期', '引渡日')} />
        </tr>
      </T>
    </>
  )
}

function Keys({ d, store = false }: { d: Data; store?: boolean }) {
  return (
    <>
      <tr>
        <H rowSpan={2}>貸与する鍵</H>
        <H>鍵No</H>
        <D v={d.cf('鍵No', '鍵番号') ?? (store ? '玄関・シャッター' : '玄関')} className="text-center" />
        <D v={d.cf('メールBOX鍵No') ?? 'メールBOX'} className="text-center" />
        <D v={d.cf('宅配BOX鍵No') ?? '宅配BOX'} colSpan={2} className="text-center" />
      </tr>
      <tr>
        <H>本数</H>
        <D v={d.cf('鍵本数', '鍵の本数', '玄関鍵本数')} className="text-center" />
        <D v={d.cf('メールBOX鍵本数')} className="text-center" />
        <D v={d.cf('宅配BOX鍵本数')} colSpan={2} className="text-center" />
      </tr>
    </>
  )
}

function Payment({ d }: { d: Data }) {
  return (
    <>
      <tr>
        <H colSpan={2}>賃料等の支払時期</H>
        <D v={d.cf('支払時期', '賃料等の支払時期', '支払日')} colSpan={4} />
      </tr>
      <tr>
        <H rowSpan={3}>賃料等の<br />支払方法</H>
        <D className="w-24"><CheckMark label="振込" /></D>
        <H>振込先</H>
        <D v={d.cf('振込先', '振込口座')} colSpan={3} className="whitespace-pre-wrap" />
      </tr>
      <tr>
        <D><CheckMark label="持参" /></D>
        <H>持参先</H>
        <D v={d.cf('持参先')} colSpan={3} />
      </tr>
      <tr>
        <D><CheckMark label="口座振替" /></D>
        <H>委託会社名</H>
        <D v={d.cf('口座振替委託会社', '委託会社名', '集金代行会社')} colSpan={3} />
      </tr>
    </>
  )
}

function Lessor({ d, no }: { d: Data; no: string }) {
  const own = d.bukken.management_type === MANAGEMENT_TYPE.OWN
  return (
    <>
      <SectionTitle>頭書({no}) 貸主及び管理業者</SectionTitle>
      <T>
        <tr><H rowSpan={2} className="w-24">貸主</H><D>氏名 <E v={own ? d.orgName : d.cf('貸主', '貸主氏名', 'オーナー', 'オーナー名')} minW="16em" /></D></tr>
        <tr><D>住所 <E v={d.cf('貸主住所', 'オーナー住所')} minW="20em" /></D></tr>
      </T>
      <T className="mt-1">
        <tr><H className="w-24">管理業者</H><D colSpan={2}>商号又は名称 <E v={d.orgName} minW="14em" /></D></tr>
        <tr><H>所在地</H><D colSpan={2}><E v={d.cf('管理業者所在地', '会社住所')} minW="20em" /> <span className="ml-4">TEL <E v={d.cf('管理業者TEL', '会社電話番号')} minW="9em" /></span></D></tr>
        <tr><H colSpan={2} className="text-left">賃貸住宅管理業者登録制度登録番号</H><D v={d.cf('賃貸住宅管理業者登録番号')} /></tr>
        <tr><H colSpan={2} className="text-left">(一社)全国賃貸不動産管理業協会会員番号</H><D v={d.cf('全国賃貸不動産管理業協会会員番号')} /></tr>
        <tr><H rowSpan={2}>管理担当者</H><D colSpan={2}>氏名 <E v={d.cf('管理担当者')} minW="12em" /></D></tr>
        <tr><D colSpan={2}>賃貸不動産経営管理士:登録番号 <E v={d.cf('賃貸不動産経営管理士登録番号')} minW="10em" /></D></tr>
      </T>
      <p className="mt-2 text-[11px]">※貸主と建物の所有者が異なる場合は、次の欄も記載すること。</p>
      <T>
        <tr><H rowSpan={2} className="w-24">所有者</H><D>氏名 <E v={d.cf('所有者', '所有者氏名')} minW="16em" /></D></tr>
        <tr><D>住所 <E v={d.cf('所有者住所')} minW="20em" /></D></tr>
      </T>
    </>
  )
}

function Guarantee({ d, no }: { d: Data; no: string }) {
  const company = d.room.guarantee_company
  const person = d.cf('連帯保証人', '連帯保証人氏名')
  return (
    <>
      <SectionTitle>頭書({no}) 乙の債務の担保</SectionTitle>
      <T>
        <tr>
          <H rowSpan={4} className="w-28 text-left text-[10px] font-normal">担保の方法<br />(本契約で採用するものにチェックし、その右欄に所定の事項を記載する)</H>
          <D rowSpan={2} className="w-24"><CheckMark checked={!!person} label="連帯保証人" /></D>
          <H className="w-24">氏名</H>
          <D v={person} />
          <H className="w-16">極度額</H>
          <D v={d.cf('極度額')} className="w-28" />
        </tr>
        <tr><H>住所</H><D v={d.cf('連帯保証人住所')} colSpan={3} /></tr>
        <tr>
          <D rowSpan={2}><CheckMark checked={!!company} label="家賃債務保証会社の提供する保証" /></D>
          <H>家賃債務保証会社名</H>
          <D v={company} colSpan={3} />
        </tr>
        <tr><H>主たる事務所の所在地</H><D v={d.cf('保証会社所在地')} colSpan={3} /></tr>
      </T>
    </>
  )
}

function EmergencyRows({ d, head }: { d: Data; head: React.ReactNode }) {
  return (
    <>
      <tr><H rowSpan={4} className="w-24">{head}</H><D>(氏　名) <E v={d.cf('緊急連絡先', '緊急連絡先氏名')} minW="12em" /> <span className="ml-6">借主との関係 <E v={d.cf('緊急連絡先続柄', '緊急連絡先関係')} minW="5em" /></span></D></tr>
      <tr><D>(自　宅)TEL <E v={d.cf('緊急連絡先自宅TEL')} minW="12em" /></D></tr>
      <tr><D>(勤務先)TEL <E v={d.cf('緊急連絡先勤務先TEL')} minW="10em" /> <span className="ml-6">(名称・部署名) <E v={d.cf('緊急連絡先勤務先')} minW="10em" /></span></D></tr>
      <tr><D>(携　帯)TEL <E v={d.cf('緊急連絡先携帯', '緊急連絡先TEL')} minW="12em" /></D></tr>
    </>
  )
}

// ---------- 住居用 ----------
export function HouseSheet({ d }: { d: Data }) {
  const { room, bukken } = d
  const parking = room.parking_number && room.parking_number !== 'なし' ? `含む(${room.parking_number})` : d.cf('駐車場')
  return (
    <>
      {/* 1ページ目 */}
      <section>
        <Lead d={d} title="住宅賃貸借契約書" />

        <SectionTitle>頭書(1) 目的物件の表示</SectionTitle>
        <T>
          <tr>
            <H rowSpan={5} className="w-8">建<br />物</H>
            <H className="w-20">名　称</H>
            <D colSpan={3}>
              <div className="flex justify-between gap-2"><E v={bukken.bukken_name} minW="14em" /><span><E v={room.room_number} minW="3em" />号室</span></div>
            </D>
          </tr>
          <tr><H rowSpan={2}>所在地</H><D colSpan={3}>(住居表示) <E v={bukken.address} minW="20em" /></D></tr>
          <tr><D colSpan={3}>(登記簿) <E v={d.cf('登記簿', '登記簿上の所在地', '地番')} minW="20em" /></D></tr>
          <tr>
            <H>構　造</H>
            <D colSpan={3}>
              <div className="flex flex-wrap justify-between gap-2">
                <E v={d.cf('構造')} minW="10em" />
                <span>地上<E v={d.cf('階建', '階数')} minW="2em" />階建</span>
                <span>全<E v={d.cf('戸数', '総戸数')} minW="2em" />戸</span>
              </div>
            </D>
          </tr>
          <tr>
            <H>種　類</H><D v={BUKKEN_CATEGORY_LABEL[bukken.bukken_category]} />
            <H className="w-20">新築年月</H><D v={d.cf('新築年月', '築年月', '築年')} />
          </tr>
          <tr>
            <H colSpan={1} className="text-[11px]">住戸<br />部分</H>
            <H>間取り</H><D v={room.layout} />
            <H>床面積</H><D v={d.cf('床面積', '専有面積', '面積')} />
          </tr>
          <tr>
            <H rowSpan={4}>附<br />属<br />施<br />設</H>
            <H>駐車場</H><D v={parking} colSpan={3} />
          </tr>
          <tr><H>バイク置場</H><D v={d.cf('バイク置場')} colSpan={3} /></tr>
          <tr><H>自転車置場</H><D v={d.cf('自転車置場', '駐輪場')} colSpan={3} /></tr>
          <tr><D colSpan={4} v={d.cf('附属施設', 'その他附属施設')} /></tr>
        </T>

        <Period d={d} no="2" />

        <SectionTitle>頭書(3) 賃料等</SectionTitle>
        <T>
          <tr>
            <H colSpan={2} className="w-28">賃　料</H><D v={room.rent != null ? `月額 ${yen(room.rent)}` : null} />
            <H>共益費</H><D v={yen(room.other_fee) ?? d.cf('共益費', '管理費')} />
            <H>家財保険料</H><D v={d.cf('家財保険料', '火災保険料')} />
          </tr>
          <tr><H colSpan={2}>敷　金</H><D v={d.cf('敷金')} colSpan={5} /></tr>
          <tr><H colSpan={2}>その他の条件</H><D v={d.cf('その他の条件')} colSpan={5} /></tr>
          <tr><td colSpan={7} className="p-0">
            <T>
              <Keys d={d} />
              <Payment d={d} />
            </T>
          </td></tr>
        </T>
      </section>

      {/* 2ページ目 */}
      <section className="mt-8 break-before-page print:mt-0">
        <SectionTitle>頭書(4) 借主、緊急連絡先及び入居者</SectionTitle>
        <T>
          <tr><H className="w-24">借主氏名</H><D v={d.tenancy?.tenant_name} /></tr>
          <tr><td colSpan={2} className="p-0">
            <T>
              <EmergencyRows d={d} head="緊急連絡先" />
            </T>
          </td></tr>
        </T>
        <T className="mt-1">
          <tr><H>入居者名</H><H className="w-12">年齢</H><H className="w-14">続柄</H><H>入居者名</H><H className="w-12">年齢</H><H className="w-14">続柄</H></tr>
          <tr><D v={d.tenancy?.tenant_name} /><D v={null} /><D v={d.tenancy ? '本人' : null} /><D /><D /><D /></tr>
          <tr><D /><D /><D /><D /><D /><D /></tr>
          <tr><D /><D /><D /><D /><D /><D /></tr>
        </T>

        <Lessor d={d} no="5" />
        <Guarantee d={d} no="6" />
      </section>
    </>
  )
}

// ---------- 事業用(店舗) ----------
export function StoreSheet({ d }: { d: Data }) {
  const { room, bukken } = d
  return (
    <>
      {/* 1ページ目 */}
      <section>
        <Lead d={d} title="事業用賃貸借契約書(店舗)" />

        <SectionTitle>頭書(1) 目的物件の表示</SectionTitle>
        <T>
          <tr>
            <H rowSpan={5} className="w-8">建<br />物</H>
            <H className="w-20">名　称</H>
            <D colSpan={3}>
              <div className="flex justify-between gap-2">
                <E v={bukken.bukken_name} minW="12em" />
                <span><E v={d.cf('階', '所在階')} minW="2em" />階 <E v={room.room_number} minW="3em" />号室</span>
              </div>
              <div className="text-right">区画番号( <E v={d.cf('区画番号')} minW="6em" /> )</div>
            </D>
          </tr>
          <tr><H rowSpan={2}>所在地</H><D colSpan={3}>(住居表示) <E v={bukken.address} minW="20em" /></D></tr>
          <tr><D colSpan={3}>(登記簿) <E v={d.cf('登記簿', '登記簿上の所在地', '地番')} minW="20em" /></D></tr>
          <tr>
            <H>構　造</H>
            <D colSpan={3}>
              <div className="flex flex-wrap justify-between gap-2">
                <E v={d.cf('構造')} minW="10em" />
                <span>地上<E v={d.cf('階建', '階数')} minW="2em" />階建</span>
                <span>全<E v={d.cf('戸数', '総戸数')} minW="2em" />戸</span>
              </div>
            </D>
          </tr>
          <tr>
            <H>種　類</H><D v={d.cf('種類') ?? BUKKEN_CATEGORY_LABEL[bukken.bukken_category]} />
            <H className="w-20">新築年月</H><D v={d.cf('新築年月', '築年月', '築年')} />
          </tr>
          <tr>
            <H colSpan={2}>面　積</H><D v={d.cf('面積', '床面積', '専有面積')} />
            <H>備　考</H><D v={d.cf('物件備考', '備考')} />
          </tr>
          <tr><H colSpan={2}>附属施設</H><D v={d.cf('附属施設') ?? (room.parking_number && room.parking_number !== 'なし' ? `駐車場(${room.parking_number})` : null)} colSpan={3} /></tr>
        </T>

        <SectionTitle>頭書(2) 事業内容(具体的に記載すること)</SectionTitle>
        <T><tr><D className="h-16 align-top"><E v={d.cf('事業内容', '業種', '使用目的')} className="block w-full whitespace-pre-wrap" /></D></tr></T>

        <Period d={d} no="3" />

        <SectionTitle>頭書(4) 賃料等</SectionTitle>
        <T>
          <tr>
            <H colSpan={2} className="w-28">賃　料</H><D v={room.rent != null ? `月額 ${yen(room.rent)}` : null} />
            <H>管理・共益費</H><D v={yen(room.other_fee) ?? d.cf('共益費', '管理費')} />
            <H>家財保険料</H><D v={d.cf('家財保険料', '火災保険料')} />
          </tr>
          <tr><H colSpan={2}>敷　金</H><D v={d.cf('敷金')} colSpan={5} /></tr>
          <tr><H colSpan={2}>保証金</H><D v={d.cf('保証金')} colSpan={2} /><H>償　却</H><D v={d.cf('償却')} colSpan={2} /></tr>
          <tr><H colSpan={2}>その他の条件</H><D v={d.cf('その他の条件')} colSpan={5} /></tr>
          <tr><td colSpan={7} className="p-0">
            <T>
              <Keys d={d} store />
              <Payment d={d} />
            </T>
          </td></tr>
        </T>
      </section>

      {/* 2ページ目 */}
      <section className="mt-8 break-before-page print:mt-0">
        <SectionTitle>頭書(5) 借主緊急連絡先</SectionTitle>
        <T>
          <EmergencyRows d={d} head={<>緊急連絡先<br />(担当者)</>} />
        </T>

        <Lessor d={d} no="6" />
        <Guarantee d={d} no="7" />

        <SectionTitle>頭書(8) 更新に関する事項</SectionTitle>
        <T><tr><D className="h-16 align-top"><E v={d.cf('更新に関する事項', '更新')} className="block w-full whitespace-pre-wrap" /></D></tr></T>

        <SectionTitle>頭書(9) 特約事項</SectionTitle>
        <T><tr><D className="h-44 align-top"><E v={d.cf('特約事項', '特約')} className="block w-full whitespace-pre-wrap" /></D></tr></T>
      </section>
    </>
  )
}
