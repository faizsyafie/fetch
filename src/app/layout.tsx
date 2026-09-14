import type { Metadata } from "next";
import { Geist_Mono, Inter, Lora, Nunito, Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Extra font options for the Settings panel (see FONT_FAMILY_PRESETS in
// lib/defaults.ts) — a neutral sans, a rounded/playful sans, and an
// editorial serif, each loaded at a couple of weights to keep bundle size
// down rather than pulling the whole family.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const siteUrl = "https://fetchforme.vercel.app";
const ogTitle = "fetch | Daily RSS Company Monitor";
const ogDescription = "A loyal retriever for the information age.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: ogTitle,
  description: ogDescription,
  icons: {
    icon: "/banner-icon-dog.png",
  },
  openGraph: {
    title: ogTitle,
    description: ogDescription,
    url: siteUrl,
    siteName: "fetch",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "fetch — Daily RSS",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: ogTitle,
    description: ogDescription,
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${geistMono.variable} ${inter.variable} ${nunito.variable} ${lora.variable} h-full antialiased`}
    >
      <head>
        <script
          // Applies the persisted theme before paint to avoid a flash of the
          // wrong theme. Mirrors useTheme.ts's readTheme()/isDarkTheme()
          // logic (duplicated rather than imported since this must run
          // standalone before hydration) — keep the two in sync. The
          // "custom" branch also duplicates colorRamp.ts's
          // generateThemeFromColor so a custom theme doesn't flash the
          // default palette for a frame before useTheme's effect runs.
          dangerouslySetInnerHTML={{
            __html: `(function(){try{
  var t=localStorage.getItem("credit-news-analyst-theme");
  var valid=["light","dark","coral","midnight","sage","custom","image"];
  if(valid.indexOf(t)===-1){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}
  var root=document.documentElement;
  root.setAttribute("data-theme",t);
  if(t==="custom"||t==="image"){
    var hex=localStorage.getItem("credit-news-analyst-custom-theme-color")||"#fcf9f2";
    var m=/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex)||[];
    var r=parseInt(m[1]||"fc",16)/255,g=parseInt(m[2]||"f9",16)/255,b=parseInt(m[3]||"f2",16)/255;
    var max=Math.max(r,g,b),min=Math.min(r,g,b),l=(max+min)/2,d=max-min,h=0,s=0;
    if(d!==0){
      s=d/(1-Math.abs(2*l-1));
      if(max===r)h=((g-b)/d)%6; else if(max===g)h=(b-r)/d+2; else h=(r-g)/d+4;
      h*=60; if(h<0)h+=360;
    }
    l*=100; s*=100;
    var isDark=l<50;
    function hsl2hex(hh,ss,ll){
      var sN=ss/100,lN=ll/100,c=(1-Math.abs(2*lN-1))*sN,x=c*(1-Math.abs(((hh/60)%2)-1)),mm=lN-c/2,rr,gg,bb;
      if(hh<60){rr=c;gg=x;bb=0;} else if(hh<120){rr=x;gg=c;bb=0;} else if(hh<180){rr=0;gg=c;bb=x;}
      else if(hh<240){rr=0;gg=x;bb=c;} else if(hh<300){rr=x;gg=0;bb=c;} else {rr=c;gg=0;bb=x;}
      function toHex(ch){var v=Math.round((ch+mm)*255).toString(16);return v.length<2?"0"+v:v;}
      return "#"+toHex(rr)+toHex(gg)+toHex(bb);
    }
    var steps=["50","100","200","300","400","500","600","700","800","900","950"];
    var ramp={};
    if(!isDark){
      var floor=9;
      for(var i=0;i<steps.length;i++){
        var tt=i/(steps.length-1), eased=Math.pow(tt,1.5), stepL=l-(l-floor)*eased;
        ramp[steps[i]]=hsl2hex(h,s,Math.min(99,Math.max(floor,stepL)));
      }
    } else {
      var ceiling=92, idx900=9;
      for(var j=0;j<steps.length;j++){
        if(steps[j]==="950"){ramp[steps[j]]=hsl2hex(h,s,Math.min(97,Math.max(3,l*0.65))); continue;}
        var t2=j/idx900, eased2=Math.pow(t2,1.5), stepL2=ceiling-(ceiling-l)*eased2;
        ramp[steps[j]]=hsl2hex(h,s,Math.min(97,Math.max(3,stepL2)));
      }
    }
    root.style.setProperty("--background",ramp[isDark?"900":"50"]);
    root.style.setProperty("--foreground",ramp[isDark?"50":"900"]);
    for(var k=0;k<steps.length;k++){root.style.setProperty("--brand-"+steps[k],ramp[steps[k]]);}
    if(isDark)root.classList.add("dark");
  } else if(t==="dark"||t==="midnight"){
    root.classList.add("dark");
  }
}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full bg-brand-50 font-sans text-brand-900 dark:bg-brand-900 dark:text-brand-100">
        {children}
      </body>
    </html>
  );
}
