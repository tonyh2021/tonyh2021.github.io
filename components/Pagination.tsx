function pageUrl(page: number): string {
  return page === 1 ? '/' : `/page/${page}/`;
}

export default function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      {currentPage > 1 ? (
        <a href={pageUrl(currentPage - 1)}>&laquo; Prev</a>
      ) : (
        <span>&laquo; Prev&nbsp;</span>
      )}

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
        if (page === currentPage) {
          return <em key={page}>{page}&nbsp;</em>;
        }
        return (
          <a key={page} href={pageUrl(page)}>
            {page}&nbsp;
          </a>
        );
      })}

      {currentPage < totalPages ? (
        <a href={pageUrl(currentPage + 1)}>Next &raquo;</a>
      ) : (
        <span>Next &raquo;</span>
      )}
    </div>
  );
}
