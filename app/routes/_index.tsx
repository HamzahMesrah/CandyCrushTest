import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <h1 className="text-4xl font-bold mb-8 text-white">Welcome to Match 3 Puzzle</h1>
      <Link
        to="/game"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-xl"
      >
        Start Game
      </Link>
    </div>
  );
}
