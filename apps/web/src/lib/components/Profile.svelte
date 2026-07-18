<script lang="ts">
  import type { Profile, Statistics } from "$lib/types";

  let {
    profile,
    statistics,
    accountId,
  }: { profile: Profile; statistics: Statistics; accountId: string } = $props();
</script>

<div class="profile-info">
  <div class="profile-info__logo">
    {#if profile.avatarfull}
      <img src={profile.avatarfull} alt="" />
    {:else}
      <div class="skeleton logo-skeleton"></div>
    {/if}
  </div>

  <div class="profile-content">
    <div class="profile-buttons">
      <span class="profile-buttons__title">
        {profile.personaname ?? `Player ${accountId}`}
      </span>
      {#if profile.steam_id}
        <a
          class="profile-buttons__picture"
          href={`https://steamcommunity.com/profiles/${profile.steam_id}/`}
          target="_blank"
          rel="noreferrer"
        >
          <img src="/image/steam_icon.png" alt="Steam" />
        </a>
      {/if}
    </div>

    <div class="stats">
      <div class="stats__container">
        <span class="stats__container_text-muted">WINS</span>
        <span class="_text-succes stats__value">{statistics.wins}</span>
      </div>
      <div class="stats__container">
        <span class="stats__container_text-muted">LOSES</span>
        <span class="_text-danger stats__value">{statistics.losses}</span>
      </div>
      <div class="stats__container">
        <span class="stats__container_text-muted">WIN RATE</span>
        <span class="_text-gold stats__value">{statistics.winrate.toFixed(2)}%</span>
      </div>
    </div>
  </div>

  <div class="profile-info__rank">
    <img src="/image/rank_image-removebg-preview.png" alt="" width="124" height="124" />
  </div>
</div>

<style>
  .profile-info {
    background-color: var(--profile);
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: var(--shadow);
    min-height: 250px;
  }
  .profile-info__logo img,
  .logo-skeleton {
    border-radius: var(--radius-pill);
    width: 124px;
    height: 124px;
    object-fit: cover;
  }
  .profile-content {
    width: 35%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 2.5rem;
  }
  .profile-buttons {
    display: flex;
    align-items: center;
  }
  .profile-buttons__title {
    font-size: var(--fs-xl);
    line-height: 26px;
    padding-right: var(--space-3);
    color: var(--text-strong);
  }
  .profile-buttons__picture {
    width: 25px;
    height: 25px;
  }
  .profile-buttons__picture img {
    width: 100%;
    height: 100%;
  }
  .stats {
    padding-top: var(--space-4);
    display: flex;
  }
  .stats__container {
    display: flex;
    flex-direction: column;
    padding-right: var(--space-4);
  }
  .stats__container_text-muted {
    color: var(--text-muted);
    font-size: var(--fs-sm);
  }
  .stats__value {
    font-size: var(--fs-lg);
  }
  .profile-info__rank {
    display: flex;
    align-items: center;
  }

  @media (max-width: 768px) {
    .profile-info {
      flex-direction: column;
      padding-top: var(--space-5);
    }
    .profile-buttons,
    .stats {
      justify-content: center;
    }
    .stats__container {
      text-align: center;
      padding: 0 var(--space-3);
    }
  }
</style>
