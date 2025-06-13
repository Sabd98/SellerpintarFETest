export function Footer() {
  const getYear = new Date().getFullYear();
  return (
    <footer className="bg-blue-600/90 text-white py-5 text-center flex gap-x-3 justify-center">
      <h1>Logoipsum</h1>
      <h3>ⓒ {getYear} Blog genzet. All rights reserved. </h3>
    </footer>
  );
}
