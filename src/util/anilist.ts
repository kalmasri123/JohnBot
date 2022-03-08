const fetch = require('node-fetch');
export interface AnimeCharacter {
    firstName: string;
    lastName: string;
    fullName: string;
    names: string[];
    origin: string;
    image: string;
}
export async function getCharacters(page: number): Promise<AnimeCharacter[]> {
    let query = `query ($sort:[CharacterSort]=[FAVOURITES_DESC],$page:Int) {
        Page(perPage: 50, page: $page) {
          pageInfo {
            total
            perPage
            currentPage
            lastPage
            hasNextPage
          }
          
          characters(sort:$sort) {
                
            id
            image {
                large
                medium
              }
              name{
                full
                last
                first
              }
            media{
                nodes{
                 title {
                   romaji
                   english
                   native
                   userPreferred
                 } 
                }
              }
          }
        }
      }
      `;

    const url = 'https://graphql.anilist.co',
        options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                query,
                variables: { page },
            }),
        };
    try {
        const result = await fetch(url, options);
        let characters:AnimeCharacter[] = (await result.json()).data.Page.characters.map((el) => {
            let character: AnimeCharacter = {
                image: el.image.large || el.image.medium,
                origin: el.media.nodes[0].title.english,
                firstName: el.name.first,
                lastName: el.name.last,
                fullName: el.name.full,
                names: [el.name.first, el.name.last, el.name.full],
            };
            return character;
        });
        return characters;
    } catch (err) {
        console.log(err);
        throw new Error('Error has occurred communicating with API');
    }
}
// async function main() {
//     console.log(await getCharacters(5));
// }
// main();
