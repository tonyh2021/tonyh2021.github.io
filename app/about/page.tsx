export const metadata = {
  title: "About | Tony's Blog",
};

export default function AboutPage() {
  return (
    <div className="page">
      <h1 className="page-title">About</h1>

      <p>{"Hi. I'm Tony."}</p>

      <p>习惯于对世界保持好奇和怀疑的态度，讨厌所有重复毫无创造性的事情。如果有什么有趣的新奇事物，请一定告诉我。</p>

      <blockquote>
        <p>And one more thing...</p>
      </blockquote>

      <p>
        {`We're here to put a dent in the universe. Otherwise why else even be here?`}
      </p>

      <p>
        {`Here's to the crazy ones. The misfits. The rebels. The troublemakers. The round pegs in the square holes. The ones who see things differently. They're not fond of rules. And they have no respect for the status quo. You can quote them, disagree with them, glorify or vilify them. About the only thing you can't do is ignore them. Because they change things. They push the human race forward. And while some may see them as the crazy ones, we see genius. Because the people who are crazy enough to think they can change the world, are the ones who do.`}
      </p>

      <p style={{ textAlign: 'right' }}>-- Steve Jobs</p>

      <p className="social-icons">
        <a href="https://github.com/tonyh2021">
          <i className="fa fa-github fa-2x"></i>
        </a>
        <a href="https://stackoverflow.com/users/4172900/tony">
          <i className="fa fa-stack-overflow fa-2x"></i>
        </a>
      </p>
    </div>
  );
}
