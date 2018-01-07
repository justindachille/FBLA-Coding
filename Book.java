import java.util.Date;

/**
 * Created by justin on 1/4/2018.
 */
public class Book {

    //Instance variables
    private String author;
    private String title;
    private String publisher;
    private String genre;
    private int edition;
    private Date releaseDate;
    private int ISBN;
    private int LCCN;

    public Book(String author, String title, String publisher, String genre, int edition, Date releaseDate, int ISBN, int LCCN) {
        this.author = author;
        this.title = title;
        this.publisher = publisher;
        this.genre = genre;
        this.edition = edition;
        this.releaseDate = releaseDate;
        this.ISBN = ISBN;
    }

    public String getAuthor() {

        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getPublisher() {
        return publisher;
    }

    public void setPublisher(String publisher) {
        this.publisher = publisher;
    }

    public String getGenre() {
        return genre;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    public int getEdition() {
        return edition;
    }

    public void setEdition(int edition) {
        this.edition = edition;
    }

    public Date getReleaseDate() {
        return releaseDate;
    }

    public void setReleaseDate(Date releaseDate) {
        this.releaseDate = releaseDate;
    }

    public int getISBN() {
        return ISBN;
    }

    public void setISBN(int ISBN) {
        this.ISBN = ISBN;
    }

    public int getLCCN() {
        return LCCN;
    }

    public void setLCCN(int LCCN) {
        this.LCCN = LCCN;
    }

}
