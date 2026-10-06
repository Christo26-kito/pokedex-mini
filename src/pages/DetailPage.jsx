import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MAX_ID } from "../config.js";
import {
  capitalize,
  formatHeight,
  formatWeight,
  totalBase,
  fetchPokemonDetail,
  fetchSpecies,
  fetchEvolution,
  getWeaknesses,
  formatMult,
  describeMult,
  getSpriteUrl,
} from "../utils.js";
import StatBars from "../components/StatBars.jsx";
import RadarChart from "../components/RadarChart.jsx";
import TypeBadge from "../components/TypeBadge.jsx";
import FadeImg from "../components/FadeImg.jsx";
import { SkeletonDetail } from "../components/Skeletons.jsx";
import { useFavorites, showToast } from "../FavoritesContext.jsx";
import {
  HeartIcon,
  PokeballIcon,
  ShareIcon,
} from "../components/Icons.jsx";

const CONFETTI_COLORS = ["#f97316", "#facc15", "#2563eb", "#ec4899", "#22c55e", "#8b5cf6"];

function CleanFlavor(text) {
  return text.replace(/\n|\f/g, " ").replace(/\s+/g, " ").trim();
}

export default function DetailPage() {
  const { name } = useParams();
  const navigate = useNavigate();
  const {
    isFavorite,
    addFavorite,
    removeFavorite,
    caught,
    catchPokemon,
  } = useFavorites();

  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [evo, setEvo] = useState(null);
  const [weak, setWeak] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [spriteMode, setSpriteMode] = useState("artwork");
  const [heartPop, setHeartPop] = useState(0);
  const [confetti, setConfetti] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    setError(null);
    setPokemon(null);
    setSpecies(null);
    setEvo(null);
    setWeak(null);
    setSpriteMode("artwork");

    fetchPokemonDetail(name)
      .then((data) => {
        if (!isCurrent) return;
        setPokemon(data);
        const types = data.types.map((t) => t.type.name);
        getWeaknesses(types).then(
          (w) => isCurrent && setWeak(w),
          () => {}
        );
        fetchEvolution(data.name).then(
          (e) => isCurrent && setEvo(e),
          () => {}
        );
      })
      .catch((err) => isCurrent && setError(err.message))
      .finally(() => isCurrent && setIsLoading(false));

    fetchSpecies(name).then((sp) => {
      if (isCurrent) setSpecies(sp);
    }).catch(() => {});

    return () => {
      isCurrent = false;
    };
  }, [name]);

  const id = pokemon ? Number(pokemon.id) : null;

  function handleCatch() {
    catchPokemon(name);
    showToast(`Caught ${capitalize(name)}!`);
    setConfetti((c) => c + 1);
  }

  function toggleFavorite() {
    if (isFavorite(name)) {
      removeFavorite(name);
      showToast(`${capitalize(name)} removed from favorites`);
    } else {
      addFavorite(name);
      setHeartPop((p) => p + 1);
      showToast(`${capitalize(name)} added to favorites`);
    }
  }

  async function handleShare() {
    const url = window.location.href;
    const text = `${capitalize(name)} (#${id}) on PokéDex Mini`;
    try {
      if (navigator.share) {
        await navigator.share({ title: text, text, url });
      } else {
        await navigator.clipboard.writeText(url);
        showToast("Link copied to clipboard");
      }
    } catch {
      // user cancelled — nothing to do
    }
  }

  if (isLoading) return <SkeletonDetail />;

  if (error || !pokemon) {
    return (
      <div className="status">
        <p className="status-error">{error || "Something went wrong."}</p>
        <Link to="/" className="btn btn-primary">← Back to list</Link>
      </div>
    );
  }

  const favorite = isFavorite(name);
  const caughtCount = caught[name] || 0;
  const artwork = pokemon.sprites.other["official-artwork"]?.front_default;
  const genSprite = pokemon.sprites.front_default;
  const animated =
    pokemon.sprites.versions?.["gen5-black-white"]?.animated?.front_default;
  const flavor = CleanFlavor(
    species?.flavor_text_entries?.find(
      (t) => t.language?.name === "en" && t.flavor_text
    )?.flavor_text ?? ""
  );
  const genus = species?.genus;
  const total = totalBase(pokemon.stats);

  const spriteSrc =
    spriteMode === "sprite" ? genSprite :
    spriteMode === "animated" && animated ? animated :
    artwork;

  return (
    <div className="detail-page page-enter">
      <Link to="/" className="back-link">← Back to list</Link>

      <div className="detail-hero">
        <div className="hero-art">
          <FadeImg
            src={spriteSrc}
            alt={pokemon.name}
            width={spriteMode === "sprite" ? 96 : 148}
            height={spriteMode === "sprite" ? 96 : 148}
            pixelated={spriteMode !== "artwork"}
            className={spriteMode === "artwork" ? "hero-artwork" : "hero-sprite"}
          />
          {confetti > 0 && (
            <span className="confetti-burst" key={confetti} aria-hidden="true">
              {Array.from({ length: 14 }).map((_, i) => (
                <i
                  key={i}
                  style={{
                    background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                    ["--cx"]: `${(i % 7) * 2 + 10}%`,
                    ["--dy"]: `${40 + ((i * 37) % 50)}px`,
                    animationDelay: `${i * 18}ms`,
                  }}
                />
              ))}
            </span>
          )}
        </div>

        <div className="hero-badges" role="group" aria-label="Sprite style">
          <button
            className={`hero-tab ${spriteMode === "artwork" ? "active" : ""}`}
            onClick={() => setSpriteMode("artwork")}
            aria-pressed={spriteMode === "artwork"}
          >
            Artwork
          </button>
          {genSprite && (
            <button
              className={`hero-tab ${spriteMode === "sprite" ? "active" : ""}`}
              onClick={() => setSpriteMode("sprite")}
              aria-pressed={spriteMode === "sprite"}
            >
              Sprite
            </button>
          )}
          {animated && (
            <button
              className={`hero-tab ${spriteMode === "animated" ? "active" : ""}`}
              onClick={() => setSpriteMode("animated")}
              aria-pressed={spriteMode === "animated"}
            >
              Animated
            </button>
          )}
        </div>

        <h2>
          {capitalize(pokemon.name)}
          {genus && <span className="hero-genus">{genus}</span>}
        </h2>

        <div className="pokemon-types">
          {pokemon.types.map((t) => (
            <TypeBadge key={t.type.name} type={t.type.name} />
          ))}
        </div>

        <div className="detail-meta">
          <div className="meta-pill"><span>#{id}</span> dex</div>
          <div className="meta-pill"><span>{formatHeight(pokemon.height)}</span> tall</div>
          <div className="meta-pill"><span>{formatWeight(pokemon.weight)}</span> heavy</div>
          <div className="meta-pill"><span>{total}</span> total</div>
        </div>

        {flavor && <p className="flavor-text">“{flavor.slice(0, 220)}{flavor.length > 220 ? "…" : ""}”</p>}

        <div className="hero-actions">
          <button
            key={`fav-${heartPop}`}
            className={`btn fav-btn ${favorite ? "fav-on pop" : ""}`}
            onClick={toggleFavorite}
            aria-pressed={favorite}
          >
            <HeartIcon filled={favorite} />
            {favorite ? "Favorited" : "Favorite"}
          </button>
          <button
            className="btn catch-btn"
            onClick={handleCatch}
          >
            <PokeballIcon />
            Catch
          </button>
          <button
            className="btn btn-ghost share-btn"
            onClick={handleShare}
            aria-label="Share this Pokémon"
          >
            <ShareIcon />
          </button>
        </div>

        {caughtCount > 0 && (
          <p className="catch-count">Caught {caughtCount}×</p>
        )}
      </div>

      <RadarChart stats={pokemon.stats} />

      <StatBars stats={pokemon.stats} />

      {pokemon.abilities.length > 0 && (
        <div className="detail-section">
          <h3 className="section-title">Abilities</h3>
          <div className="ability-list">
            {pokemon.abilities.map((a) => (
              <div key={a.ability.name} className="ability-pill">
                <span className="ability-name">{capitalize(a.ability.name)}</span>
                {a.is_hidden && <span className="ability-tag">hidden</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {weak && (
        <div className="detail-section">
          <h3 className="section-title">Type matchup</h3>
          <p className="matchup-intro">
            How moves of each type hit{" "}
            <strong>{capitalize(pokemon.name)}</strong> in battle, based on its{" "}
            {pokemon.types.map((t) => capitalize(t.type.name)).join(" + ")} typing.
          </p>
          <div className="weak-panel">
            {weak.weak.length > 0 && (
              <div className="weak-group">
                <div className="weak-label-row">
                  <span className="weak-label weak-label-up">Weak to</span>
                  <span className="weak-caption">takes extra damage</span>
                </div>
                <div className="weak-chips">
                  {weak.weak.map((w) => (
                    <TypeBadge
                      key={`w-${w.type}`}
                      type={w.type}
                      small
                      mult={formatMult(w.mult)}
                      title={`${capitalize(w.type)} moves deal ${describeMult(w.mult)} to ${capitalize(pokemon.name)}`}
                    />
                  ))}
                </div>
              </div>
            )}
            {weak.resist.length > 0 && (
              <div className="weak-group">
                <div className="weak-label-row">
                  <span className="weak-label weak-label-down">Resists</span>
                  <span className="weak-caption">takes reduced damage</span>
                </div>
                <div className="weak-chips">
                  {weak.resist.map((w) => (
                    <TypeBadge
                      key={`r-${w.type}`}
                      type={w.type}
                      small
                      mult={formatMult(w.mult)}
                      title={`${capitalize(w.type)} moves deal ${describeMult(w.mult)} to ${capitalize(pokemon.name)}`}
                    />
                  ))}
                </div>
              </div>
            )}
            {weak.immune.length > 0 && (
              <div className="weak-group">
                <div className="weak-label-row">
                  <span className="weak-label weak-label-zero">Immune to</span>
                  <span className="weak-caption">takes no damage at all</span>
                </div>
                <div className="weak-chips">
                  {weak.immune.map((w) => (
                    <TypeBadge
                      key={`i-${w.type}`}
                      type={w.type}
                      small
                      mult="0×"
                      title={`${capitalize(w.type)} moves have no effect on ${capitalize(pokemon.name)}`}
                    />
                  ))}
                </div>
              </div>
            )}
            {weak.weak.length === 0 && weak.resist.length === 0 && weak.immune.length === 0 && (
              <p className="weak-none">
                Neutral — it takes normal damage from every type.
              </p>
            )}
          </div>
          <p className="matchup-legend">
            ×4 double weakness · ×2 · ½ · ¼ double resistance · 0× immune
          </p>
        </div>
      )}

      {evo && (
        <div className="detail-section">
          <h3 className="section-title">Evolution</h3>
          <div className="evo-chain">
            <div className="evo-slot">
              {evo.prev ? (
                <Link to={`/pokemon/${evo.prev.name}`} className="evo-card">
                  <span className="evo-card-name">
                    {capitalize(evo.prev.name)}
                  </span>
                </Link>
              ) : (
                <div className="evo-card evo-card-muted">
                  <span className="evo-card-name">—</span>
                </div>
              )}
              <span className="evo-slot-label">
                {evo.prev ? "evolves from" : "start of line"}
              </span>
            </div>

            <span className="evo-arrow-between" aria-hidden="true">
              →
            </span>

            <div className="evo-slot">
              <div className="evo-card evo-current">
                <FadeImg
                  src={getSpriteUrl(id)}
                  alt=""
                  width={44}
                  height={44}
                  pixelated
                />
                <span className="evo-card-name">
                  {capitalize(pokemon.name)}
                </span>
                <span className="evo-you">you are here</span>
              </div>
              <span className="evo-slot-label">this Pokémon</span>
            </div>

            {evo.next ? (
              <>
                <span className="evo-arrow-between" aria-hidden="true">
                  →
                </span>
                <div className="evo-slot">
                  <Link to={`/pokemon/${evo.next.name}`} className="evo-card">
                    <span className="evo-card-name">
                      {capitalize(evo.next.name)}
                    </span>
                  </Link>
                  <span className="evo-slot-label">evolves into</span>
                </div>
              </>
            ) : (
              <>
                <span className="evo-arrow-between evo-arrow-end" aria-hidden="true">
                  ·
                </span>
                <div className="evo-slot">
                  <div className="evo-card evo-card-muted">
                    <span className="evo-card-name">—</span>
                  </div>
                  <span className="evo-slot-label">evolution ends here</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="detail-nav">
        <button
          className="btn btn-ghost"
          onClick={() => (id > 1 ? navigate(`/pokemon/${id - 1}`) : navigate("/"))}
        >
          ← Prev
        </button>
        <button
          className="btn btn-ghost"
          onClick={() =>
            id < MAX_ID ? navigate(`/pokemon/${id + 1}`) : navigate("/")
          }
          disabled={id >= MAX_ID}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
